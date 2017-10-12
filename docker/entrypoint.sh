#!/bin/bash
set -e

if [[ -z "$PUBLIC_ADDRESS" ]]; then
        #get the address of container
        #example : default via 172.17.42.1 dev eth0 172.17.0.0/16 dev eth0 proto kernel scope link src 172.17.0.109
        PUBLIC_ADDRESS="http://`hostname -I | tr -d ' '`:8080"
fi

if [ -n "$DB_ENV_MYSQL_DATABASE" ]; then

        while ! curl http://$DB_PORT_3306_TCP_ADDR:$DB_PORT_3306_TCP_PORT/
        do
          echo "$(date) - still trying to connect to mysql"
          sleep 1
        done

        #copy the original files
        cp ${SPAGOBI_DIRECTORY}/server.xml.tmpl ${SPAGOBI_DIRECTORY}/conf/server.xml

        # Get the database values from the relation.
        DB_USER=$DB_ENV_MYSQL_USER
        DB_DB=$DB_ENV_MYSQL_DATABASE
        DB_PASS=$DB_ENV_MYSQL_PASSWORD
        DB_HOST=$DB_PORT_3306_TCP_ADDR
        DB_PORT=$DB_PORT_3306_TCP_PORT

        #insert spago bi metadata into db if it doesn't exist
        Result=`mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASS}" "${DB_DB}" -e "SHOW TABLES LIKE '%SBI_%';"`
        if [ -z "$Result" ]; then
                mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASS}" "${DB_DB}" --execute="source $MYSQL_SCRIPT_DIRECTORY/MySQL_create.sql"
                mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASS}" "${DB_DB}" --execute="source $MYSQL_SCRIPT_DIRECTORY/MySQL_create_quartz_schema.sql"
                mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASS}" "${DB_DB}" --execute="source $MYSQL_SCRIPT_DIRECTORY/MySQL_create_social.sql"
        fi

        #replace hsql with mysql
        #replace in server.xml
        old_driver='org\.hsqldb\.jdbcDriver'
        new_driver='com\.mysql\.jdbc\.Driver'
        sed -i "s|${old_driver}|${new_driver}|" ${SPAGOBI_DIRECTORY}/conf/server.xml
        old_connection='jdbc:hsqldb:file:${catalina.base}/database/spagobi'
        mysql_connection='jdbc:mysql://'${DB_HOST}':'${DB_PORT}'/'${DB_DB}
        sed -i "s|${old_connection}|${mysql_connection}|" ${SPAGOBI_DIRECTORY}/conf/server.xml
        old_username_password='username="sa" password=""'
        new_username_password='username="'${DB_USER}'" password="'${DB_PASS}'"'
        sed -i "s|${old_username_password}|${new_username_password}|" ${SPAGOBI_DIRECTORY}/conf/server.xml
fi

#replace the address of container inside server.xml
sed -i "s_http:\/\/.*:8080_${PUBLIC_ADDRESS}_g" ${SPAGOBI_DIRECTORY}/conf/server.xml
sed -i "s_http:\/\/192\.168\.93\.1:8080_${PUBLIC_ADDRESS}_g" ${SPAGOBI_DIRECTORY}/webapps/SpagoBIConsoleEngine/WEB-INF/web.xml
sed -i "s_http:\/\/192\.168\.93\.1:8080_${PUBLIC_ADDRESS}_g" ${SPAGOBI_DIRECTORY}/webapps/SpagoBIChartEngine/WEB-INF/web.xml

exec "$@"
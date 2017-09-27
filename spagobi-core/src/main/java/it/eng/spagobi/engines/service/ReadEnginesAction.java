/* SpagoBI, the Open Source Business Intelligence suite

 * Copyright (C) 2012 Engineering Ingegneria Informatica S.p.A. - SpagoBI Competency Center
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0, without the "Incompatible With Secondary Licenses" notice. 
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */
package it.eng.spagobi.engines.service;

import it.eng.spago.security.IEngUserProfile;
import it.eng.spagobi.commons.dao.DAOFactory;
import it.eng.spagobi.commons.deserializer.DeserializerFactory;
import it.eng.spagobi.commons.serializer.SerializerFactory;
import it.eng.spagobi.commons.services.AbstractSpagoBIAction;
import it.eng.spagobi.engines.config.bo.Engine;
import it.eng.spagobi.engines.config.dao.IEngineDAO;
import it.eng.spagobi.tenant.TenantManager;
import it.eng.spagobi.tools.datasource.bo.DataSource;
import it.eng.spagobi.tools.datasource.dao.IDataSourceDAO;
import it.eng.spagobi.utilities.exceptions.SpagoBIServiceException;
import it.eng.spagobi.utilities.service.JSONSuccess;

import java.util.List;

import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class ReadEnginesAction extends AbstractSpagoBIAction {

	private static final long serialVersionUID = 1L;

	// logger component
	public static Logger logger = Logger.getLogger(ReadEnginesAction.class);

	public static final String STRING_TYPE = "string";
	public static final String NUMBER_TYPE = "number";
	public static final String RAW_TYPE = "raw";
	public static final String GENERIC_TYPE = "generic";
	
	public static final String ENGINE_LIST = "ENGINE_LIST";
	public static final String ENGINE_DATASOURCES = "ENGINE_DATASOURCES";
	//public static final String ENGINE_TEST = "ENGINE_TEST";

	
	public static final String START = "start";
	public static final String LIMIT = "limit";
	public static final Integer START_DEFAULT = 0;
	public static final Integer LIMIT_DEFAULT = 20;
	
	public static final String MESSAGE_DET = "MESSAGE_DET";
	
	private IEngUserProfile profile;
	
	

	@Override
	public void doService() {
		logger.debug("IN");
		
		IEngineDAO engineDao;
		profile = getUserProfile();
		try {
			engineDao = DAOFactory.getEngineDAO();
//			engineDao.setUserProfile(profile);
			
			//engines must not be filtered by tenant, so unset tenant filter		
			TenantManager.unset();
			
		} catch (Throwable t) {
			throw new SpagoBIServiceException(SERVICE_NAME,	"An unexpected error occured while instatiating the dao", t);			
		}
	
		String serviceType = this.getAttributeAsString(MESSAGE_DET);
		logger.debug("Service type "+serviceType);

		if (serviceType != null && serviceType.equalsIgnoreCase(ENGINE_LIST)) {			
			listEngines(engineDao);
		} else if (serviceType != null	&& serviceType.equalsIgnoreCase(ENGINE_DATASOURCES)) {			
			getDataSources();
		} 

		else {
			throw new SpagoBIServiceException(SERVICE_NAME, "Impossible to process action of type [" + serviceType + "]");
		}
		
		logger.debug("OUT");
	}

	private void listEngines(IEngineDAO engineDao)   {
		List<Engine> engines;
		
		Integer start = getAttributeAsInteger( START );
		Integer limit = getAttributeAsInteger( LIMIT );
		if(start==null){
			start = START_DEFAULT;
		}
		if(limit==null){
			limit = LIMIT_DEFAULT;
		}
		
		Integer enginesNum = 0;
		try {
			//engines = engineDao.loadAllEngines();
			enginesNum = engineDao.countEngines();
			
			engines = engineDao.loadPagedEnginesList(start, limit);
			
		} catch (Throwable t) {
			throw new SpagoBIServiceException(SERVICE_NAME, "Impossible to load engines from database", t);
		}
		
		JSONObject responseJSON;
		try {
			JSONArray enginesJSON = (JSONArray) SerializerFactory.getSerializer("application/json").serialize(engines, getLocale());
			responseJSON = createJSONResponse(enginesJSON, enginesNum);
		} catch (Throwable t) {
			throw new SpagoBIServiceException(SERVICE_NAME, "Impossible to serialize engines", t);
		}
		
		try {
			writeBackToClient(new JSONSuccess(responseJSON));
		} catch (Throwable t) {
			throw new SpagoBIServiceException(SERVICE_NAME, "Impossible to write back response to client", t);
		}
	}
	
	private JSONObject createJSONResponse(JSONArray rows, Integer totalResNumber)
	throws JSONException {
		JSONObject results;

		results = new JSONObject();
		results.put("total", totalResNumber);
		results.put("title", "BIEngines");
		results.put("rows", rows);
		return results;
	}
	
	private void getDataSources(){
		IDataSourceDAO dataSourceDao = null;
		profile = getUserProfile();
		List<DataSource> dataSources;

		try {
			dataSourceDao = DAOFactory.getDataSourceDAO();
			dataSourceDao.setUserProfile(profile);
			dataSources = dataSourceDao.loadAllDataSources();

		} catch (Throwable t) {
			throw new SpagoBIServiceException(SERVICE_NAME,	"An unexpected error occured while instatiating the dao", t);			

		}
		
		JSONObject responseJSON;
		try {
			JSONArray dataSourcesJSON = (JSONArray) SerializerFactory.getSerializer("application/json").serialize(dataSources, getLocale());
			responseJSON = createJSONResponse(dataSourcesJSON, dataSources.size());
		} catch (Throwable t) {
			throw new SpagoBIServiceException(SERVICE_NAME, "Impossible to serialize engines", t);
		}
		
		try {
			writeBackToClient(new JSONSuccess(responseJSON));
		} catch (Throwable t) {
			throw new SpagoBIServiceException(SERVICE_NAME, "Impossible to write back response to client", t);
		}
		
		
	}




}

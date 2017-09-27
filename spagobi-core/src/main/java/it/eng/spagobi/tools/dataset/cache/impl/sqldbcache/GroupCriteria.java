/**

SpagoBI - The Business Intelligence Free Platform

Copyright (C) 2005-2010 Engineering Ingegneria Informatica S.p.A.

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

**/
package it.eng.spagobi.tools.dataset.cache.impl.sqldbcache;

/**
 * @author Marco Cortella (marco.cortella@eng.it)
 *
 */
public class GroupCriteria {
	
	//For the GROUP BY clause
	
	String dataset;
	String columnName; //the column name
	String aggregateFunction; //optional aggregate function like SUM, AVG, etc...
	
	
	
	/**
	 * @param columnName
	 * @param aggregateFunction
	 */
	public GroupCriteria(String dataset, String columnName, String aggregateFunction) {
		this.dataset = dataset;
		this.columnName = columnName;
		this.aggregateFunction = aggregateFunction;
	}
	
	
	
	public String getDataset() {
		return dataset;
	}



	public void setDataset(String dataset) {
		this.dataset = dataset;
	}



	/**
	 * @return the columnName
	 */
	public String getColumnName() {
		return columnName;
	}
	/**
	 * @param columnName the columnName to set
	 */
	public void setColumnName(String columnName) {
		this.columnName = columnName;
	}
	/**
	 * @return the aggregateFunction
	 */
	public String getAggregateFunction() {
		return aggregateFunction;
	}
	/**
	 * @param aggregateFunction the aggregateFunction to set
	 */
	public void setAggregateFunction(String aggregateFunction) {
		this.aggregateFunction = aggregateFunction;
	}
	
	
}

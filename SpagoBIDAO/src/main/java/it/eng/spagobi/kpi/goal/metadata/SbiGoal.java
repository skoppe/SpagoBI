/* SpagoBI, the Open Source Business Intelligence suite

 * Copyright (C) 2012 Engineering Ingegneria Informatica S.p.A. - SpagoBI Competency Center
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0, without the "Incompatible With Secondary Licenses" notice. 
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */
package it.eng.spagobi.kpi.goal.metadata;

// Generated 6-dic-2010 11.29.21 by Hibernate Tools 3.2.4.GA

import it.eng.spagobi.commons.metadata.SbiHibernateModel;

import java.util.Date;

/**
 * SbiGoal generated by hbm2java
 */
public class SbiGoal extends SbiHibernateModel {

	private int goalId;
	private int hierarchyId;
	private int grantId;
	private Date startDate;
	private Date endDate;
	private String name;
	private String label;
	private String description;
	private SbiGoalHierarchy sbiGoalHierarchy;

	public SbiGoal() {
	}

	public SbiGoal(int goalId, int hierarchyId, int grantId, Date startDate,
			Date endDate, String name, String label) {
		this.goalId = goalId;
		this.hierarchyId = hierarchyId;
		this.grantId = grantId;
		this.startDate = startDate;
		this.endDate = endDate;
		this.label = label;
		this.name = name;
	}

	public SbiGoal(int goalId, int hierarchyId, int grantId, Date startDate,
			Date endDate, String name, String label, String description,
			SbiGoalHierarchy sbiGoalHierarchy) {
		this.goalId = goalId;
		this.hierarchyId = hierarchyId;
		this.grantId = grantId;
		this.startDate = startDate;
		this.endDate = endDate;
		this.name = name;
		this.label = label;
		this.description = description;
		this.sbiGoalHierarchy = sbiGoalHierarchy;
	}

	public int getGoalId() {
		return this.goalId;
	}

	public void setGoalId(int goalId) {
		this.goalId = goalId;
	}

	public int getHierarchyId() {
		return this.hierarchyId;
	}

	public void setHierarchyId(int hierarchyId) {
		this.hierarchyId = hierarchyId;
	}

	public int getGrantId() {
		return this.grantId;
	}

	public void setGrantId(int grantId) {
		this.grantId = grantId;
	}

	public Date getStartDate() {
		return this.startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}

	public Date getEndDate() {
		return this.endDate;
	}

	public void setEndDate(Date endDate) {
		this.endDate = endDate;
	}

	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return this.description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public SbiGoalHierarchy getSbiGoalHierarchy() {
		return this.sbiGoalHierarchy;
	}

	public void setSbiGoalHierarchy(SbiGoalHierarchy sbiGoalHierarchy) {
		this.sbiGoalHierarchy = sbiGoalHierarchy;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}
	

}

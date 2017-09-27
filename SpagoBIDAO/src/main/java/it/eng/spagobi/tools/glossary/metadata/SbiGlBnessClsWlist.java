package it.eng.spagobi.tools.glossary.metadata;

import it.eng.spagobi.analiticalmodel.document.metadata.SbiObjects;
import it.eng.spagobi.commons.metadata.SbiHibernateModel;

public class SbiGlBnessClsWlist extends SbiHibernateModel {

	private static final long serialVersionUID = -7917478737232664376L;

	private SbiGlBnessClsWlistId id;
	
	private SbiGlWord word;
	private SbiGlBnessCls bness_cls;
	
	private String column_name;

	public SbiGlBnessClsWlist() {

	}


	/**
	 * @param word
	 * @param bness_cls
	 */
	public SbiGlBnessClsWlist(SbiGlWord word, SbiGlBnessCls bness_cls,String column_name) {
		super();
		this.word = word;
		this.bness_cls = bness_cls;
		this.column_name=column_name;
	}


	/**
	 * @return the id
	 */
	public SbiGlBnessClsWlistId getId() {
		return id;
	}


	/**
	 * @param id the id to set
	 */
	public void setId(SbiGlBnessClsWlistId id) {
		this.id = id;
	}


	/**
	 * @return the word
	 */
	public SbiGlWord getWord() {
		return word;
	}


	/**
	 * @param word the word to set
	 */
	public void setWord(SbiGlWord word) {
		this.word = word;
	}


	/**
	 * @return the bness_cls
	 */
	public SbiGlBnessCls getBness_cls() {
		return bness_cls;
	}


	/**
	 * @param bness_cls the bness_cls to set
	 */
	public void setBness_cls(SbiGlBnessCls bness_cls) {
		this.bness_cls = bness_cls;
	}


	/**
	 * @return the column_name
	 */
	public String getColumn_name() {
		return column_name;
	}


	/**
	 * @param column_name the column_name to set
	 */
	public void setColumn_name(String column_name) {
		this.column_name = column_name;
	}

	


}

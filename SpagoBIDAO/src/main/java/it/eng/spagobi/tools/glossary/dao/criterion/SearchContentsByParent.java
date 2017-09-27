package it.eng.spagobi.tools.glossary.dao.criterion;

import it.eng.spagobi.commons.dao.ICriterion;
import it.eng.spagobi.tools.glossary.metadata.SbiGlContents;

import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;

public class SearchContentsByParent implements ICriterion<SbiGlContents> {
	private final Integer glossaryId;
	private final Integer parentId;

	public SearchContentsByParent(Integer glossaryId, Integer parentId) {
		this.glossaryId = glossaryId;
		this.parentId = parentId;
	}

	@Override
	public Criteria evaluate(Session session) {
		Criteria c = session.createCriteria(SbiGlContents.class);
		if (glossaryId != null)
			c.add(Restrictions.eq("glossary.glossaryId", glossaryId));
		if (parentId != null){
			c.add(Restrictions.eq("parent.contentId", parentId));
		}else{
			c.add(Restrictions.isNull("parent.contentId"));
		}
		c.addOrder((Order.asc("contentNm")));
		return c;
	}

}

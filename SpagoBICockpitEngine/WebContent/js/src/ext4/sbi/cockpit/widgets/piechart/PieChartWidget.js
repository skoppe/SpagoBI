/** SpagoBI, the Open Source Business Intelligence suite

 * Copyright (C) 2012 Engineering Ingegneria Informatica S.p.A. - SpagoBI Competency Center
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0, without the "Incompatible With Secondary Licenses" notice. 
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. **/
 

Ext.define('Sbi.cockpit.widgets.piechart.PieChartWidge', {
	extend: 'Sbi.cockpit.core.WidgetRuntime'
//	, layout:'fit'

	, config:{
		  title: LN('sbi.cockpit.widgets.table.pieChartWidgetDesigner.title')
		, border: false
	}

	, chartDivId : null
	, chart : null
	, chartConfig : null 	

	, constructor : function(config) {
		Sbi.trace("[PieChartWidget.constructor]: IN");
		this.initConfig(config);
		this.initEvents();
		this.init(config);
		this.callParent(arguments);
		this.addEvents("attributeDblClick", "attributeRemoved");
		Sbi.trace("[PieChartWidget.constructor]: OUT");
	}
	
	, initComponent: function() {
  
        Ext.apply(this,{
        	html : '<div id="' + this.chartDivId + '""></div>'
        });
        
        this.callParent();
    } 	
	
    // =================================================================================================================
	// METHODS
	// =================================================================================================================
	
    // -----------------------------------------------------------------------------------------------------------------
    // public methods
	// -----------------------------------------------------------------------------------------------------------------
	
	/**
	 * Loads the data for the chart.. Call the action which loads the crosstab 
	 * (the crosstab is the object that contains the data for the chart)
	 * @param dataConfig the field for the chart..
	 * The syntax is {rows, measures}.. For example {'rows':[{'id':'it.eng.spagobi.SalesFact1998:product(product_id):productClass(product_class_id):productFamily','nature':'attribute','alias':'Product Family','iconCls':'attribute'}],'measures':[{'id':'it.eng.spagobi.SalesFact1998:storeCost','nature':'measure','alias':'Store Cost','funct':'SUM','iconCls':'measure'},{'id':'it.eng.spagobi.SalesFact1998:unitSales','nature':'measure','alias':'Unit Sales','funct':'SUM','iconCls':'measure'}]}
	 */
	//TODO: move this method on a generic class parent
	, loadChartData: function(dataConfig, filters){
		
		if ( !this.chartConfig.hiddenContent ){
			
			var encodedParams = Ext.JSON.encode({
				'rows': dataConfig.columns,
				'columns': dataConfig.rows,
				'measures': dataConfig.measures,
				'config': {'measureson':'rows'}
			});
			
			var requestParameters = {
					'crosstabDefinition': encodedParams
					
			};
			if ( filters != null ) {
				requestParameters.FILTERS = Ext.encode(filters);
			}
			Ext.Ajax.request({
		        //url: this.services['loadData'],//load the crosstab from the server
				url: Sbi.config.serviceReg.getServiceUrl('loadChartDataSetStore', {
					pathParams: {datasetLabel: this.storeId}
				}),
		        params: requestParameters,
		        success : function(response, opts) {
		        	
		        	this.dataContainerObject = Ext.util.JSON.decode( response.responseText );
		        	//this.update(' <div id="' + this.chartDivId + '" style="width: 100%; height: 100%;"></div>');
		        	if (this.isEmpty()) {
//		        		this.update(' <div id="' + this.chartDivId + '" style="width: 100%; height: 100%;"></div>');
		    			Ext.Msg.show({
		 				   title: LN('sbi.qbe.messagewin.info.title'),
		 				   msg: LN('sbi.qbe.datastorepanel.grid.emptywarningmsg'),
		 				   buttons: Ext.Msg.OK,
		 				   icon: Ext.MessageBox.INFO
		    			});
		    			this.fireEvent('contentloaded');
		        	} else {
			        	if(this.rendered){
			        		this.createChart();
			        		this.fireEvent('contentloaded');
			        	}else{
			        		this.on('afterrender',function(){this.createChart();this.fireEvent('contentloaded');}, this);
			        	}
			        	
		        	}
		        	
		        },
		        scope: this,
				failure: function(response, options) {
					this.fireEvent('contentloaded');
					Sbi.exception.ExceptionHandler.handleFailure(response, options);
				}      
			});
		}else{
        	if(this.rendered){
        		this.fireEvent('contentloaded');
        	}else{
        		this.on('afterrender',function(){this.fireEvent('contentloaded');}, this);
        	}
		}
	}
	
	//TODO: move this method on a generic class parent

	, getJsonStoreExt3: function(percent){
		var storeObject = {};
		
		var series = this.getSeries();
		var categories = this.getCategories();
		
		var data = new Array();
		var fields = new Array();
		var serieNames = new Array();
	
		
		for(var i=0; i<categories.length; i++){
			var z = {};
			var seriesum = 0;
			for(var j=0; j<series.length; j++){
				z['series'+j] = ((series[j]).data)[i];
				seriesum = seriesum + parseFloat(((series[j]).data)[i]);
			}
			if(percent){
				for(var j=0; j<series.length; j++){
					z['seriesflatvalue'+j] = z['series'+j];
					z['series'+j] = (z['series'+j]/seriesum)*100;;
				}	
			}
			z['seriesum'] = seriesum;
			z['categories'] = categories[i];
			data.push(z);
		}
		
		for(var j=0; j<series.length; j++){
			fields.push('series'+j);
			fields.push('seriesflatvalue'+j);
			serieNames.push(series[j].name);
		}
		
		fields.push('seriesum');
		fields.push('categories');
	
		
	    var store = new Ext.data.JsonStore({
	        fields:fields,
	        data: data
	    });
	    
	    storeObject.store = store;
	    storeObject.serieNames = serieNames;
	
	    return storeObject;
	}

	/**
	 * Loads the series for the chart
	 */
	//TODO: move this method on a generic class parent
	, getSeries: function(){
		if(this.dataContainerObject!=null){
			var runtimeSeries = this.getRuntimeSeries();
			var data = this.dataContainerObject.data;
			var measures_metadata = this.dataContainerObject.measures_metadata;
			var measures_metadata_map = {};
			//load the metadata of the measures (we need the type)
			var i=0;
	
			for(; i<measures_metadata.length; i++){
				measures_metadata_map[measures_metadata[i].name] ={'format':measures_metadata[i].format, 'type': measures_metadata[i].type};
				//measures_metadata_map[measures_metadata[i].name].scaleFactorValue = (this.getMeasureScaleFactor(measures_metadata[i].name)).value;
				measures_metadata_map[measures_metadata[i].name].scaleFactorValue = 1;
			}
			var series = [];
			var serie;
			var map ;
			var serieData, serieDataFormatted;
			i=0;
			for (; i < runtimeSeries.length; i++){
				serie = {};
				serie.name = runtimeSeries[i].name;
				var measure = runtimeSeries[i].measure;
				serieData = this.dataContainerObject.data[i];
				serieDataFormatted = [];
				var j=0;
				for(; j<serieData.length; j++){
					map = measures_metadata_map[measure];
					serieDataFormatted.push(this.format(serieData[j], map.type, map.format, map.scaleFactorValue ));
				}
				serie.data = serieDataFormatted;
				serie.shadow = false;
				series.push(serie);
			}	
			return series;
		}
	}
	//TODO: move this method on a generic class parent
    , format: function(value, type, format, scaleFactor) {
    	if(value==null){
    		return value;
    	}
		try {
			var valueObj = value;
			if (type == 'int') {
				valueObj = (parseInt(value))/scaleFactor;
			} else if (type == 'float') {
				valueObj = (parseFloat(value))/scaleFactor;
			} else if (type == 'date') {
				valueObj = Date.parseDate(value, format);
			} else if (type == 'timestamp') {
				valueObj = Date.parseDate(value, format);
			}
			return valueObj;
		} catch (err) {
			return value;
		}
	}
	
	/**
	 * Load the categories for the chart
	 */
	//TODO: move this method on a generic class parent
	, getCategories: function(){
		if(this.dataContainerObject!=null){
			var measures = this.dataContainerObject.columns.node_childs;
			var categories = [];
			var i=0;
			for(; i<measures.length; i++){
				categories.push(measures[i].node_description);
			}
			return  categories;
		}
	}
	//TODO: move this method on a generic class parent
	, getRuntimeSeries : function () {
		var toReturn = [];
		// rows (of dataContainerObject) can contain 2 level, it depends if a groupingVariable was defined or not
		if (this.chartConfig.groupingVariable != null) {
			// first level contains groupingVariable, second level contains series
			var groupingAttributeValues = this.dataContainerObject.rows.node_childs;
			for(var i = 0; i < groupingAttributeValues.length; i++) {
				var measureNodes = groupingAttributeValues[i].node_childs;
				for(var j = 0; j < measureNodes.length; j++) {
					toReturn.push({
						name : groupingAttributeValues[i].node_description + 
								( measureNodes.length > 1 ? ' [' + measureNodes[j].node_description + ']' : '' )
						, measure : measureNodes[j].node_description
					});
				}
			}
		} else {
			// no grouping variable: series are just first level nodes
			var measureNodes = this.dataContainerObject.rows.node_childs;
			for(var i = 0; i < measureNodes.length; i++) {
				toReturn.push({
					name : measureNodes[i].node_description
					, measure : measureNodes[i].node_description
				});
			}
		}
		return toReturn;
	}
	
	//TODO: move this method on a generic class parent
	, formatLegendWithScale : function(theSerieName) {
		var serie = this.getRuntimeSerie(theSerieName);
		var toReturn = this.formatTextWithMeasureScaleFactor(serie.name, serie.measure);
		return toReturn;
	}
	//TODO: move this method on a generic class parent
	, getRuntimeSerie : function (theSerieName) {
		var allRuntimeSeries = this.getRuntimeSeries();
		var i = 0;
		for (; i < allRuntimeSeries.length; i++) {
			if (allRuntimeSeries[i].name === theSerieName) {
				return allRuntimeSeries[i];
			}
		}
		return null;
	}	

	//TODO: move this method on a generic class parent
	, formatTextWithMeasureScaleFactor : function(text, measureName) {
		var legendSuffix = (this.getMeasureScaleFactor(measureName)).text;
		if (legendSuffix != '' ) {
			return text + ' ' + legendSuffix;
		}
		return text;
	}
	
	//TODO: move this method on a generic class parent
	, getColors : function () {
		return this.chartConfig.colors;
	}
	
	//TODO: move this method on a generic class parent
	, addChartConfExt3: function(chartConf, showTipMask){
		if((this.chartConfig.showlegend !== undefined) ? this.chartConfig.showlegend : true){
			if (chartConf.extraStyle === undefined || chartConf.extraStyle == null) {
				chartConf.extraStyle = {};
			}
			chartConf.extraStyle.legend = this.legendStyle;
		}
		chartConf.tipRenderer = this.getTooltipFormatter();
	}

    , refresh:  function() {  
		//TODO: must implement this
	}


    , createChart: function () {
		var storeObject = this.getJsonStoreExt3();
		var extraStyle ={};
		var items = new Array();
		this.byteArrays=new Array();
		for(var i=0; i<storeObject.serieNames.length; i++){
			var chartSerieNumber = 'series'+i;
			
			
			var itemChart = {
				store: storeObject.store,
				categoryField: 'categories',
				title: 'Month',
				serieNumber: i,
				serieName: this.formatLegendWithScale(storeObject.serieNames[i]),
	            dataField: chartSerieNumber,
	            style: 'height: 85%;',
	            extraStyle: extraStyle,
	            series:[{
	                style: {
	                    colors: this.chartConfig.colors
	                    }
	                }]
			};
			//set the height if ie
	    	if(Ext.isIE){
	    		itemChart.height = this.ieChartHeight;
	    	}

			//configuration (legend and values)
	    	this.addChartConfExt3(itemChart);
	    	
			//percentage
			if (this.chartConfig.showpercentage) {

				var seriesum=0;
				for(var j=0; j<storeObject.store.totalLength; j++){
					seriesum = seriesum + parseFloat(((storeObject.store.getAt(j)).data)[chartSerieNumber]);
				}
				itemChart.seriesum = seriesum;
			}
			
			var titlePanel = new Ext.Panel({
				border: false,
				html: '<div style=\"padding-top: 5px; color: rgb(255, 102, 0);\" align=\"center\"><font size=\"4\"><b>'+itemChart.serieName+'</b></font></div>'
			});
			
			var chartPanel =  new Ext.chart.PieChart(itemChart);
			
			
			var exportChartPanel  = new Ext.Panel({
				border: false,
				
				
				html: '<div style=\"padding-top: 5px; padding-bottom: 5px; font: 11px tahoma,arial,helvetica,sans-serif;\">'+LN('sbi.worksheet.runtime.worksheetruntimepanel.chart.includeInTheExport')+'</div>'
			});
			
			var chartContainer = new Ext.Panel({
				border: false,
				items: [exportChartPanel, titlePanel,chartPanel]
			});
			
			items.push(chartContainer);
			this.on('contentclick', function(event){
				chartContainer.fireEvent('contentclick');	
			}, this);
			
			chartContainer.on('contentclick', function(event){
				try{
					this.byteArrays.push(chartPanel.exportPNG());	
				}catch(e){}
			
				exportChartPanel.update('');
			}, this);
		}
		
		
		new Ext.Panel({
			renderTo : this.chartDivId,
			//layout: 'fit',
			border: false,
			items: items
		});
		
		//this.on('contentclick', function(event){
		
	}	
	// -----------------------------------------------------------------------------------------------------------------
    // private methods
	// -----------------------------------------------------------------------------------------------------------------
	
	//----- Ext 4 Implementation related functions ------------------------------------------
//	, getChartExt4 : function(horizontal, items, colors){
//		
//		var chartDataStore = items.store;
//		
//		var chartType; 
//		var isStacked = false;
//		
//		//Define Ext4 Chart appropriate type
//		if(horizontal){
//			if(this.chartConfig.type == 'stacked-barchart' || this.chartConfig.type == 'percent-stacked-barchart'){
//				chartType = 'bar';
//				isStacked = true;
//			}else{
//				chartType = 'bar';
//			}
//		} else {
//			if(this.chartConfig.type == 'stacked-barchart' || this.chartConfig.type == 'percent-stacked-barchart'){
//				chartType = 'column';
//				isStacked = true;
//			}else{
//				chartType = 'column';
//			}
//		}
//		//Create Axes Configuration
//		var chartAxes = this.createAxes(horizontal, items);
//		//Create Series Configuration
//		var chartSeries = this.createSeries(horizontal, items, chartType, isStacked);
//		
//		//Legend visibility
//		var showlegend;
//		if (this.chartConfig.showlegend !== undefined){
//			showlegend = this.chartConfig.showlegend;
//		} else {
//			showlegend = true;
//		}
//		
//		//Create theme for using custom defined colors
//		Ext.define('Ext.chart.theme.CustomTheme', {
//		    extend: 'Ext.chart.theme.Base',
//
//		    constructor: function(config) {
//		        this.callParent([Ext.apply({
//		            colors: colors
//		        }, config)]);
//		    }
//		});
//		
//	    var chart = Ext.create("Ext.chart.Chart", {
//	        width: '100%',
//	    	height: '100%',
//	    	theme: 'CustomTheme',
//	        hidden: false,
//	        title: "My Chart",
//	        renderTo: this.chartDivId,
//	        layout: "fit",
//	        style: "background:#fff",
//	        animate: true,
//	        store: chartDataStore,
//	        shadow: true,
//	        legend: showlegend,
//	        axes: chartAxes,
//	        series: chartSeries
//
//	    });
//	    
//	    return chart;
//	}
//	//TODO: WIP	
//	, createSeries : function(horizontal,items, chartType, isStacked){
//		var axisPosition;
//		var series = [];
//		
//		if (horizontal){
//			//bar chart
//			axisPosition = 'bottom';
//		} else {
//			//column chart
//			axisPosition = 'left';
//		}
//		
//		var seriesNames = [];
//		var displayNames = [];
//		
//
//		//Extract technical series names and corresponding name to display
//		for (var i=0; i< items.series.length; i++){
//			var name;
//			if (horizontal){
//				name = items.series[i].xField;
//			} else {
//				name = items.series[i].yField;
//			}
//			seriesNames.push(name);
//			var displayName = items.series[i].displayName;
//			displayNames.push(displayName);
//		}
//		
//		//Costruct the series object(s)
//		var aSerie = {
//                type: chartType,
//                highlight: {
//                    size: 7,
//                    radius: 7
//                },
//                axis: axisPosition,
//                smooth: true,
//                stacked: isStacked,
//                xField: "categories",
//                yField: seriesNames,	                
//                title: displayNames,
//    	        tips: {
//	            	  trackMouse: true,
//	            	  minWidth: 140,
//	            	  maxWidth: 300,
//	            	  width: 'auto',
//	            	  minHeight: 28,
//	            	  renderer: function(storeItem, item) {
//	            		   this.setTitle(String(item.value[0])+" : "+String(item.value[1]));
//	            	  }
//    	        }
//                
//         };
//		series.push(aSerie);
//		
//		return series;
//	}
//	
//	//TODO: WIP
//	, createAxes : function(horizontal,items){
//		var axes;	
//		var positionNumeric;
//		var positionCategory;
//
//		if (horizontal){
//			//bar chart
//			positionNumeric = 'bottom';
//			positionCategory = 'left';
//		} else {
//			//column chart
//			positionNumeric = 'left';
//			positionCategory = 'bottom';
//		}
//		
//		var seriesNames = [];
//		
//		for (var i=0; i< items.series.length; i++){
//			var name;
//			if (horizontal){
//				name = items.series[i].xField;
//			} else {
//				name = items.series[i].yField;
//			}
//			seriesNames.push(name);
//		}
//
//		axes = [{
//			type: "Numeric",
//			minimum: 0,
//			position: positionNumeric,
//			fields: seriesNames,
//			title: "Series",
//			minorTickSteps: 1,
//			grid: true
//		}, {
//			type: "Category",
//			position: positionCategory,
//			fields: ["categories"],
//			title: "Category"
//		}];
//		
//		return axes;
//	}
//	
	
	///---------------------------------------------------------------------
	
//	, setPercentageStyleExt3 : function(chart, horizontal){
//		var axis =  new Ext.chart.NumericAxis({
//			stackingEnabled: true,
//			minimum: 0,
//			maximum: 100
//		});
//	
//		if(horizontal){
//			chart.xAxis = axis;
//		}else{
//			chart.yAxis = axis;
//		}
//	
//	
//	}
	
//	, getChartExt3 : function (horizontal, config) {
//		if(horizontal){
//			if(this.chartConfig.type == 'stacked-barchart' || this.chartConfig.type == 'percent-stacked-barchart'){
//				return new Ext.chart.StackedBarChart(config);
//			}else{
//				return new Ext.chart.BarChart(config);
//			}
//		} else {
//			if(this.chartConfig.type == 'stacked-barchart' || this.chartConfig.type == 'percent-stacked-barchart'){
//				return new Ext.chart.StackedColumnChart(config);
//			}else{
//				return new Ext.chart.ColumnChart(config);
//			}
//		}
//	}
	
	, getChartSeriesExt3: function(serieNames, colors, horizontal){
		var seriesForChart = new Array();
		for(var i=0; i<serieNames.length; i++){
			var serie = {	
	                style: {}
			};
			
//			if(this.chartConfig.type == 'percent-stacked-barchart'){
//				serie.displayName =  (serieNames[i]);//if percent doesn't matter the scale 
//			}else{
				//serie.displayName =  this.formatLegendWithScale(serieNames[i]); //Commented by MC
//			}
			serie.displayName =  serieNames[i];
			
			if(horizontal){
				serie.xField = 'series'+i;
			}else{
				serie.yField = 'series'+i;
			}
			
			if(colors!=null){
				serie.style.color= colors[i];
			}
			
			seriesForChart.push(serie);
		}
		return seriesForChart;
	}
	
	//reload the store after hide a series
	, reloadJsonStoreExt3: function(chart,reloadCallbackFunctionScope ){
		var oldDataStore= chart.store;
		var hiddenseries= chart.hiddenseries;
		var percent = ((reloadCallbackFunctionScope.chartConfig.type).indexOf('percent')>=0);
		
		if(percent){
			var series = reloadCallbackFunctionScope.getSeries();
			var categories = reloadCallbackFunctionScope.getCategories();
			
			var data = new Array();
			var fields = new Array();
			var serieNames = new Array();

			for(var i=0; i<categories.length; i++){
				var z = {};
				var seriesum = 0;
				for(var j=0; j<series.length; j++){
					z['series'+j] = ((series[j]).data)[i];
					if(hiddenseries.indexOf(j)<0){
						seriesum = seriesum + parseFloat(((series[j]).data)[i]);
					}
				}
				for(var j=0; j<series.length; j++){
					z['seriesflatvalue'+j] = z['series'+j];
					z['series'+j] = (z['series'+j]/seriesum)*100;;
				}
				z['seriesum'] = seriesum;
				z['categories'] = categories[i];
				data.push(z);
			}
			oldDataStore.loadData(data);
		}else{
			chart.refresh();
		}

	}
	
	, getTooltipFormatter: function () {
		var showPercentage = this.chartConfig.showpercentage;
		var allSeries = this.chartConfig.series;
	
		var getFormattedValueExt3 = this.getFormattedValueExt3;

		var toReturn = function (chart, record, index, series) {
		
			var valuePrefix= '';
			var valueSuffix = '';

			var value = getFormattedValueExt3(chart, record, series, allSeries);

			valuePrefix = record.data.categories+'\n';

			if(showPercentage){
				valueSuffix = '\n'+ +Ext.util.Format.number(100*record.data['series'+chart.serieNumber]/ chart.seriesum, '0.00') + '%';
			}

			return valuePrefix+value+valueSuffix;

		};
		return toReturn;
	}
	
//	Format the value to display
	, getFormattedValueExt3: function (chart, record, series, allSeries){
		var theSerieNam;
		var value ;
		var serieDefinition;

		value = record.data['series'+chart.serieNumber];
		theSerieName = chart.serieName;
		
		// find the serie configuration
		var i = 0;
		for (; i < allSeries.length; i++) {
			//substring to remove the scale factor
			if (allSeries[i].seriename === theSerieName.substring(0, allSeries[i].seriename.length)) {
				serieDefinition = allSeries[i];
				break;
			}
		}


		// format the value according to serie configuration
		value = Sbi.qbe.commons.Format.number(value, {
			decimalSeparator: Sbi.locale.formats['float'].decimalSeparator,
			decimalPrecision: serieDefinition.precision,
			groupingSeparator: (serieDefinition.showcomma) ? Sbi.locale.formats['float'].groupingSeparator : '',
					groupingSize: 3,
					currencySymbol: '',
					nullValue: ''
		});
		

		// add suffix
		if (serieDefinition.suffix !== undefined && serieDefinition.suffix !== null && serieDefinition.suffix !== '') {
			value = value + ' ' + serieDefinition.suffix;
		}
		return value;

	}
	
	//------------------------------------------------------------------------------------------------------------------
	// utility methods
	// -----------------------------------------------------------------------------------------------------------------
//	, getByteArraysForExport: function(){
//		var byteArrays = new Array();
//		for(var i=0; i<this.charts; i++){
//			byteArrays.push((this.charts[i]).exportPNG());
//		}	
//	}
//	
//	, isEmpty : function () {
//		var measures = this.dataContainerObject.columns.node_childs;
//		return measures === undefined;
//	}

	// -----------------------------------------------------------------------------------------------------------------
	// init methods
	// -----------------------------------------------------------------------------------------------------------------

	, init : function () {
			this.loadChartData({'rows':[this.chartConfig.category],'measures':this.chartConfig.series});
	}

});

Sbi.registerWidget('piechart', {
	name: 'Pie Chart'
	, icon: 'js/src/ext4/sbi/cockpit/widgets/piechart/piechart_64x64_ico.png'
	, runtimeClass: 'Sbi.cockpit.widgets.piechart.PieChartWidget'
	, designerClass: 'Sbi.cockpit.widgets.piechart.PieChartWidgetDesigner'
	//, designerClass: 'Ext.Panel'
});
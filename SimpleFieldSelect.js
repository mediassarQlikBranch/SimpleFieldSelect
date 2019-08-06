define( ["qlik", "jquery", "css!./SimpleFieldStyle.css","text!./datepicker.css","./properties.def","text!./select2/select2.css","./jquery-ui.min","./select2/select2.min"], 
	function ( qlik, $, cssContent, cssDatepick, propertiesdef,select2css) {
	'use strict';
	/*if (!$("#sfscss").length>0){
		$( '<style id="sfscss">' ).html( cssContent ).appendTo( "head" );
	}*/
	var debug = false;
	var initialParameters = {'qWidth':1, 'qHeight':10000};
	//var sfsstatus = {};
	var sfsdefaultselstatus = {};
	var keepaliverTimer;

	//If nothing selected but should be
	function checkDefaultValueSelection($element,countselected,layout,self,app,sfssettings){
	  if(debug) console.log('checkin default selection, selected: '+countselected);
	  
	  var selectDefaults = layout.props.allwaysOneSelectedDefault != '' || layout.props.selectAlsoThese != '';
	  if (selectDefaults && layout.props.selectDefaultsOnlyOnce && sfsdefaultselstatus[layout.qInfo.qId] == 1){
	  	if(debug) console.log('Defaults already selected');
		return;
	  }
	  if (countselected==0 && selectDefaults){
		var defaulttoselect = $element.find( '.defaultelement' );
		var otherdefaultelememnts = $element.find('.otherdefelem');

		//check if element is found
		/*if (defaulttoselect.length<1 && otherdefaultelememnts.length<1) {
			if(debug) console.log('Default value was not found' +layout.qInfo.qId);
			return;
		}*/
		var otherDefaultElementsSelectionStyle = true; //depends on if the main default value is selected
		var valuesToSelect = [];
		sfsdefaultselstatus[layout.qInfo.qId] = 1;
		if (defaulttoselect.length>0){
			if(debug) console.log('selecting default value');
			if (layout.props.visualizationType=='dropdown'){
				if (layout.props.dimensionIsVariable){
					defaulttoselect.addClass('selected');
					selectValueInQlik(self, defaulttoselect.html() ,layout,app,true,$element,sfssettings); //select here, no other defaults
				} else {
					selectValueInQlik(self, parseInt(defaulttoselect.val(),10) ,layout,app,true,$element,sfssettings); //select here, no other defaults
				}
			  
			  return false; //no need to continue
			} else {
			  if (layout.props.dimensionIsVariable){
			  	defaulttoselect.addClass('selected');
			  	valuesToSelect.push( defaulttoselect.html() );
			  } else {
			  	valuesToSelect.push( parseInt(defaulttoselect.attr( "dval" ),10) );
			  }
			  otherDefaultElementsSelectionStyle = false;
			}
		}
		if (!layout.props.selectOnlyOne && otherdefaultelememnts.length>0){
			if(debug) console.log('selecting other defaults, method: '+otherDefaultElementsSelectionStyle);
			otherdefaultelememnts.each(function(elem){
				valuesToSelect.push( parseInt($(this).attr( "dval" ),10) );
			});
		}
		if (valuesToSelect.length>0){
			if(debug){ console.log('select many'); console.log(valuesToSelect);}
			selectValuesInQlik(self, valuesToSelect ,layout,app,false,$element,sfssettings);
		}
	  }
	}
	function checkUserCSSstyle2(css, checkquote){
		if (css){
			css.trim();
			if (css != '' && css.slice(-1) != ';'){
				css += ';';
			}
			if (checkquote){
				css = css.replace(/"/g, "'"); //replace " to '
			}
		} else {
			css = '';
		}
		return css;
	}
	function createglobalCSS(pr){
		var gcss = '';
		if (pr.global_bgcolor){
			gcss += ' .qv-client #qv-stage-container .qvt-sheet, .qv-client.qv-card #qv-stage-container .qvt-sheet, .qv-client.qv-card #qv-stage-container .qvt-sheet:not(.qv-custom-size), .sheet-list #grid, .qvt-sheet.qv-custom-size #grid { background-color:'+pr.global_bgcolor+';}';
		}
		var customObjectSelector = '';//, customParentObjectSelector = '';
		
		if (pr.global_customselector){
			var sArray = [];
			var selectors = pr.global_customselector.split(";");
			selectors.forEach(function(i){
				sArray.push('.qv-object-'+i);
				//selectors3.push('.qv-gridcell:not(.qv-gridcell-empty):has(> .qv-object-'+i+')');
			});
			customObjectSelector = ' '+sArray.join(',');
			//customParentObjectSelector = ' '+selectors3.join(',');
		}
		if (pr.global_bgcss){
			gcss += ' .qv-client #qv-stage-container .qvt-sheet, .qv-client.qv-card #qv-stage-container .qvt-sheet {'+pr.global_bgcss+'}';
		}
		if (pr.global_borderwidth && pr.global_borderwidth != '-'){
			gcss += ' .sheet-grid .qv-gridcell:not(.qv-gridcell-empty),.qv-mode-edit .qv-gridcell:not(.qv-gridcell-empty), .sheet-grid:not(.library-dragging)#grid .qv-gridcell.active { border-width:'+pr.global_borderwidth+'px;}';
		}
		if (pr.global_bordercolor){ //tbfixed, border on more than one level
			/*if (customObjectSelector){
				gcss += customParentObjectSelector+' { border-color:'+pr.global_bordercolor+';}';
			} else {

				gcss += ' .sheet-grid .qv-gridcell:not(.qv-gridcell-empty) { border-color:'+pr.global_bordercolor+';}';
			}*/
			gcss += ' .sheet-grid .qv-gridcell:not(.qv-gridcell-empty) { border-color:'+pr.global_bordercolor+';}';
		}
		if (typeof pr.global_bordercolor2 === 'undefined'){ //use nro 1
			
			gcss += ' .sheet-grid .qv-gridcell:not(.qv-gridcell-empty) { border-color:'+pr.global_bordercolor+';}';
		} else if (pr.global_bordercolor2){ //tbfixed, border on more than one level
			
			gcss += ' .sheet-grid .qv-gridcell:not(.qv-gridcell-empty) .qv-object { border-color:'+pr.global_bordercolor2+'!important;}';
		}
		if(pr.global_elementbgcolor && pr.global_elementbgcolor != ''){
			if (customObjectSelector){
				gcss += customObjectSelector+' {background-color:'+pr.global_elementbgcolor+'!important;}';
			} else {
				gcss += ' .qv-client #qv-stage-container #grid .qv-object-wrapper .qv-inner-object, .qv-client.qv-card #qv-stage-container #grid .qv-object-wrapper .qv-inner-object {background-color:'+pr.global_elementbgcolor+'!important;}'; //ow element style
			}
			
		}
		if(pr.global_customObjCSS){
			if (customObjectSelector){
				gcss += customObjectSelector+' {'+checkUserCSSstyle2(pr.global_customObjCSS,1)+'}';
			} else {
				gcss += ' .qv-object {'+ checkUserCSSstyle2(pr.global_customObjCSS,1) +'}';
			}
		}
		if(pr.removeHeaderFromTextImageObjects){
			gcss += " .qv-object-text-image header {display:none!important;}";
		}
		if(pr.removeHeaderFromAllObjects){
			gcss += " .qv-object header {display:none!important;}";
		}
		if(pr.headerTpadding_global && pr.headerTpadding_global != '-'){
			gcss += " .qv-object header h1 {padding-top:"+pr.headerTpadding_global+"px!important;}";
		}
		if(pr.headerBpadding_global && pr.headerBpadding_global != '-'){
			gcss += " .qv-object header  {padding-bottom:"+pr.headerBpadding_global+"px!important;}";
		}
		if(pr.headerfontcolor_global && pr.headerfontcolor_global != ''){
			gcss += " .qv-object header h1 {color:"+pr.headerfontcolor_global+"!important;}";
		}
		if(pr.headerbgcolor_global && pr.headerbgcolor_global != ''){
			gcss += " .qv-object header {background-color:"+pr.headerbgcolor_global+"!important;}";
		}
		if(pr.leftpadding_global && pr.leftpadding_global != '-'){
			gcss += ' .qv-object .qv-inner-object {padding-left:'+pr.leftpadding_global+'px!important;}';
		}
		if(pr.rightpadding_global && pr.rightpadding_global != '-'){
			gcss += ' .qv-object .qv-inner-object {padding-right:'+pr.rightpadding_global+'px!important;}';
		}
		if(pr.removeHeaderIfNoText){
			gcss += ' .qv-object header.thin {display:none!important;}';
		}
		if(pr.fontfamily_global && pr.fontfamily_global != ''){
			gcss += ' .qv-object * {font-family:"'+pr.fontfamily_global+'";}';
		}
		
		if(pr.global_fontcolor && pr.global_fontcolor != ''){
			gcss += ' .qv-client #qv-stage-container .qvt-sheet {color:'+pr.global_fontcolor+';}';
			gcss += ' .qvt-visualization-title, .qv-object-SimpleFieldSelect .inlinelabeldiv, .qv-object .qv-media-tool-html {color:'+pr.global_fontcolor+';}';
		}
		if(pr.hidepivotTableSelectors){
			gcss += " .qv-object .left-meta-headers,.qv-object .top-meta {display:none!important;}";
		}
		if(pr.hideInsightsButton){
			gcss += " .qv-insight-toggle-button {display:none!important;}";
			//$(".qv-insight-toggle-button").css('display','none'); //make sure
		}
		if(pr.hideSelectionsTool){
			gcss += ' .qv-subtoolbar-button[tid="currentSelections.toggleGlobalSelections"] {display:none!important;}';
		}
		if(pr.hideSmartSearchButton){
			gcss += ' .qv-subtoolbar-button[tid="toggleGlobalSearchButton"] {display:none!important;}';
		}
		if(pr.hideGuiToolbar && $(".qv-mode-edit").length == 0){
			if($("#qv-toolbar-container").length>0) {//pre 2019 feb
				gcss += ' #qv-toolbar-container {display:none!important;}';
				//$("#qv-toolbar-container").css('display','none');
			} else {
				gcss += ' .qs-toolbar-container {display:none!important;}';
				//$(".qs-toolbar-container").css('display','none');
			}
			gcss += '.qv-panel {height:100%;}';
		}
		if (pr.toolbarTxt && !pr.hideGuiToolbar){
			if ($("#sfstoolbartxt").length==0){
				if ($(".qui-buttonset-left").length>0){ //pre 2019 feb
					$(".qui-buttonset-left").append('<div id="sfstoolbartxt"></div>');
				} else {
					$(".qs-toolbar__left").append('<div id="sfstoolbartxt"></div>');
				}
			}
			$("#sfstoolbartxt").html(pr.toolbarTxt); //'+pr.toolbarTxt+'
		}
		if(pr.hideToolbarCenter && !pr.hideGuiToolbar){
			if (pr.hideToolbarCenterPerm){
				$(".qs-toolbar__center").remove();
			} else {
				gcss += ' .qs-toolbar__center {display:none!important;}';	
			}
			
		}
		if(pr.global_selectBGcolor){
			gcss += '.qv-listbox .serverLocked, .qv-listbox .serverSelected, .qv-listbox li.selected { background-color: '+pr.global_selectBGcolor+';}';
			gcss += '.qv-state-count-bar .state.selected {background:'+pr.global_selectBGcolor+';}'
		}
		if(pr.global_selectBordercolor){
			gcss += '.qv-listbox .serverLocked, .qv-listbox .serverSelected, .qv-listbox li.selected { border-bottom: 1px solid '+pr.global_selectBordercolor+';}';
		}
		if(pr.global_selectFontcolor){
			gcss += '.qv-listbox .serverLocked, .qv-listbox .serverSelected, .qv-listbox li.selected { color: '+pr.global_selectFontcolor+';}';
		}
		return gcss;
	}
	//not in use yet
	//var forcedelements = $element.find('.forcedelem');
	  //if forced, no need to check defaults
	  /*if (forcedelements.length>0){
	  	checkForcedSelection(layout,self,app,forcedelements);
	  	return false;
	  }*/
	function checkForcedSelection(layout,self,app,forcedelements,sfssettings){
		var valuesToSelect = [];
		forcedelements.each(function(elem){
			valuesToSelect.push( parseInt($(this).attr( "dval" ),10) );
		});
		if (valuesToSelect.length>0){
			selectValuesInQlik(self, valuesToSelect ,layout,app,false,$element,sfssettings);
		}
	}
	function selectValueInQlik(self,value,layout,app,selectvalueMethod,$element,sfssettings){ //selectvalueMethod true or false. This is not used for datepicker
		//Variable
		if (layout.props.dimensionIsVariable){
			if(debug) console.log('set variable value to '+value);
			if (! (sfssettings.variableOptionsForValuesArray && sfssettings.variableOptionsForValuesArray.length>0)){
				if(debug) console.log('No values in variableOptionsForValuesArray');
				return;
			}
			if(layout.props.variableName=='' || !layout.props.variableName || typeof layout.props.variableName =='object'){
				if(debug) console.log('Variable name is empty');
				return;	
			}
			var valueTxt = '';
			if ( layout.props.varMultiselectAllow){
				var varvaluelist = [], varvalueSelectedIndexes = [];
				 $element.find('.selected').each(function(sel){
					var ind = parseInt($(this).attr("dval"));
					if (ind>=0){
						varvaluelist.push( sfssettings.variableOptionsForValuesArray[ind] );
						varvalueSelectedIndexes.push(ind);
					}
				});
				if (varvaluelist){
					valueTxt = varvaluelist.join(layout.props.varMultiselectSep);
					if(debug) {console.log('multivalues to select to var '); console.log(varvaluelist);}
				} else {
					valueTxt = '';
				}
			} else {
				valueTxt = sfssettings.variableOptionsForValuesArray[ value ];
				//if value is not defined, forexample nothing is selected for variable.
				var clearingSelection = 0;
				if (typeof valueTxt == 'undefined' ){
					valueTxt = '';
					clearingSelection = 1;
				}
				if(layout.props.variableEmptyAlreadySelected && layout.variableValue==valueTxt){
					valueTxt = '';
					clearingSelection = 1;
				}
			}
			if(debug) console.log(' means '+valueTxt+' to variable ' +layout.props.variableName);
			//set variable
			app.variable.setStringValue(layout.props.variableName, valueTxt);
			//set key value too if defined
			if (sfssettings.variableOptionsForKeysArray != [] && layout.props.variableNameForKey && sfssettings.variableOptionsForKeysArray[ value ]){
				var keyTxt = '';
				if ( layout.props.varMultiselectAllow){
					var varkeylist = [];
					varvalueSelectedIndexes.forEach(function(ind){
						varkeylist.push(sfssettings.variableOptionsForKeysArray[ind]);
					});
					keyTxt = varkeylist.join(layout.props.varMultiselectSep);
				} else {
					keyTxt = sfssettings.variableOptionsForKeysArray[ value ];
				}
				if(debug) console.log(' key value '+keyTxt+' to variable ' +layout.props.variableNameForKey);
				if (clearingSelection){ //if main value is being set to empty, set key also.
					keyTxt = '';
				}
				app.variable.setStringValue(layout.props.variableNameForKey, keyTxt);
			}
		//set field
		} else {
			if(debug) console.log('set value to index '+value);
			if(isNaN(value)){
				self.backendApi.selectValues( 0, [], selectvalueMethod );
			} else {
				self.backendApi.selectValues( 0, [value], selectvalueMethod );
			}
			
		}
	}
	//select manyvalues at the same time
	function selectValuesInQlik(self,values,layout,app,selectvalueMethod,$element,sfssettings){
		if(debug) { console.log('set values to indexes '); console.log(values); }
		if (layout.props.dimensionIsVariable){
			var valueToSet = values[0];
			selectValueInQlik(self,valueToSet,layout,app,selectvalueMethod,$element,sfssettings);
		} else {
			self.backendApi.selectValues( 0, values, selectvalueMethod );
		}
	}
	//leonardo ui class
	function createLUIclass(addLUIclasses,inputtype,visInputFieldType){
		if(addLUIclasses){
			if(inputtype=='dropdown' || inputtype=='select2'){
				return ' lui-select';
			} else if(inputtype=='checkbox'){
				return ' lui-checkbox';
			} else if(inputtype=='radio'){
				return ' lui-radiobutton';
			} else if(inputtype=='btn'){
				return ' lui-button';
			} else if(inputtype=='input'){
				if(visInputFieldType=='range'){
					return '';
				} else if (visInputFieldType=='color'){
					return ' lui-select';
				} else {
					return ' lui-input';
				}

			}
		}
		return '';
	}
	return {
		initialProperties: {
			qListObjectDef: {
				qShowAlternatives: true,
				//qFrequencyMode: "V",
				qInitialDataFetch: [{
					qWidth: initialParameters['qWidth'],
					qHeight: initialParameters['qHeight']
				}],
				qSortByState: 0,
			},
			variableValue: {},
			maxLimitvariableValue: {},
			props: {
				dimensionIsVariable: false
			}
		},
		
		definition: propertiesdef,
		support : {
			snapshot: false,
			export: function( layout ) {
				return layout.props.exportenabled;
			},
			exportData : false
		},
		resize: function($element,layout){
			if (debug) console.log('resize method');
			var pr = layout.props;
			if (pr.visualizationType=='actions'){
				if (debug) console.log('resize paint');
				this.paint( $element,layout);
			}
			
			if(pr.enableGlobals){
				//when exiting edit mode.
				if(pr.hideGuiToolbar && $(".qv-mode-edit").length == 0){
					$("#qv-toolbar-container").hide();
				}
				//reset keepaliver
				if(pr.keepaliver && pr.keepaliver>0){
					setKeepaliver(self,pr.keepaliver);
				}
			}
			//remove attributes origW and origH
			return false;
		},
		/*mounted: function( $element){
			if (debug){ console.log('mounted'); }
			globalAllSelectionsCleared = 0; //reset
		},*/
		controller: ['$scope', '$element', function ($scope, $element) {
			if (debug) console.log('controller init');
			var scpr = $scope.layout.props;
			//globalAllSelectionsCleared = 0; //reset
			if (scpr.enableGlobals && scpr.clearAllSelOnFirstLoad){
				if (debug) console.log('clear all');
				var app = qlik.currApp();
				app.clearAll();
			} else if (scpr.clearFieldSelOnFirstLoad){
				if(debug) console.log('clear selections');
				$scope.backendApi.selectValues( 0, [], false );
				//var app = qlik.currApp(); //alternative
				//app.field($scope.layout.qListObject.qDimensionInfo.qFallbackTitle).clear();
			}
			if (scpr.enableGlobals && scpr.clearAllSelOnLeave){
				$scope.$on('$destroy', function (ev) {
					if (debug) console.log('clear all');
					var app = qlik.currApp();
					app.clearAll();
				});
			} else if (scpr.clearFieldSelOnLeave){
				$scope.$on('$destroy', function (ev) {
					if (debug) console.log('clear selections');
					$scope.backendApi.selectValues( 0, [], false );
				});
			}
			$scope.$on('$destroy', function (ev) {
				var contextmenuID = 'sfsrmenu';//+$scope.layout.qInfo.qId;
				$("."+contextmenuID+",.sfssel2c,#sfsselect2").remove(); //removes if exists
			});
			
		}],
		paint: function ( $element,layout ) {
			if (debug){ console.log('start painting '+layout.qInfo.qId); console.log($element);}
			var self = this, html = "";
			var app = qlik.currApp();
			var pr = layout.props;
			var visType = pr.visualizationType;
			var sfssettings = {};

			//exit if needed, no dimension, not txtonly, variable empty
			if (pr.dimensionIsVariable){
				if((!pr.variableName || pr.variableName=='')){
					$element.html('<h3>Set / check variable name !</h3>');
					return qlik.Promise.resolve();
				}
			} else if ((pr.rightclikcmenu_getselectionurl || pr.rightclikcmenu_getselurltoclipboard) && pr.rightclikcmenu_getselectionurlAsButton){
				pr.rightclikcmenu_getselectionurlAsButtonTxt = pr.rightclikcmenu_getselectionurlAsButtonTxt ? pr.rightclikcmenu_getselectionurlAsButtonTxt : 'Get current selections as an URL';
				$element.html('<button type="button" class="sfs_getselectionurl lui-button">'+pr.rightclikcmenu_getselectionurlAsButtonTxt+'</button>');
				$(".sfs_getselectionurl").click(function(){
					getSelectedUrl('dialog');
				});
				return qlik.Promise.resolve();
			//actions
			} else if (pr.visualizationType=='actions') {
				
			} else {
				if (layout.qListObject.qDataPages.length==0 && visType !='txtonly' ) {
					$element.html('<h3>Select one dimension or variable first!</h3> Or use textarea only - visualization option<br /> Datepicker can only control a variable. To use datepicker, select a varibale and enable "Variable is a date selector"-option.');
					return qlik.Promise.resolve();
				}
			}
			//if dimension is there, data exists
			var matrixdata = [];
			if (layout.qListObject.qDataPages[0] && layout.qListObject.qDataPages[0].qMatrix.length > 0){
				var rowcount = layout.qListObject.qDataPages[0].qMatrix.length;
				var allrowscount = self.backendApi.getRowCount();
				if(allrowscount > rowcount){ //if more rows need to be fetched
					var lastrow = 0;
					this.backendApi.eachDataRow( function ( rownum, row ) {
						lastrow = rownum;
					});
					if (debug) console.log('fetching more rows ' + lastrow);
					if(allrowscount > lastrow +1){
						var requestPage = [{
							qTop: lastrow + 1, qLeft: 0,
							qWidth: initialParameters['qWidth'],
							qHeight: Math.min( initialParameters['qHeight'], allrowscount - lastrow )
						}];
						this.backendApi.getData( requestPage ).then( function ( dataPages ) {
							self.paint( $element,layout );
						} );
						$element.html('wait for data');
						return qlik.Promise.resolve();
					} else {
						//finally read all
						this.backendApi.eachDataRow( function ( rownum, row ) {
							matrixdata[rownum] = row;
						});
					}
				} else {
					//use matrix data if paging is nor needed.
					matrixdata = layout.qListObject.qDataPages[0].qMatrix;
				}
			}
			if (debug) console.log(layout);
			
			var objectCSSid = 'sf'+layout.qInfo.qId;
			var extraStyle = ''; //object spesific
			//change header size
			var headerelement = $element.parent().parent().prev();
			if (pr && pr.showHeader){
				headerelement.show();
				if (pr.headerSize && pr.headerSize != '-'){
					headerelement.css('height',pr.headerSize+'px');
				}
				if (pr.headerBpadding && pr.headerBpadding != '-'){
					headerelement.css('padding-bottom',pr.headerBpadding+'px');
				}
				if (pr.headerTpadding && pr.headerTpadding != '-'){
					headerelement.find('h1').css('padding-top',pr.headerTpadding+'px');
				}
			} else {
				headerelement.hide();
			}
			//borders and bg
			var articleInnerElement = headerelement.parent();
			var articleElement = articleInnerElement.parent();
			var gridcell = articleElement.closest('.qv-gridcell');
			if (pr.transparentBackground){
				articleElement.css('background-color','transparent');
				articleInnerElement.css('background-color','transparent');
			} else if (pr.specialBackgroundColor){
				articleElement.css('background-color',pr.specialBackgroundColor);
				articleInnerElement.css('background-color',pr.specialBackgroundColor);
			} else {
				articleElement.css('background-color','');
				articleInnerElement.css('background-color','');
			}
			if (pr.noBorders){
				articleElement.css('border-width','0');
				gridcell.css('border-width','0');
			} else {
				if (pr.ownBordercolor2 != ''){
					articleElement.css('border-color',pr.ownBordercolor2);
				}
				if (pr.ownBordercolor != ''){
					gridcell.css('border-color',pr.ownBordercolor);
				}
			}
			if (pr.removeYscroll){
				articleInnerElement.find('.qv-object-content-container').css('overflow-y','hidden');
			}
			if (pr.showXscroll){
				articleInnerElement.find('.qv-object-content-container').css('overflow-x','auto');
			}
			if (pr.whitespacenowrap){
				extraStyle += ' .'+objectCSSid + ', .'+objectCSSid + ' .sfe {white-space:nowrap; display:inline-block;}';
				if (visType=='luiradio'){
					extraStyle += ' .'+objectCSSid + ' .lui-radiobutton {padding-right:5px;}'
				}
			}
			if (pr.elWidth){
				extraStyle += ' .'+objectCSSid +' .sfe {width:'+checkUserCSSstyle2(pr.elWidth,0)+'}';
			}
			if (pr.elHeight){
				extraStyle += ' .'+objectCSSid +' .sfe {height:'+checkUserCSSstyle2(pr.elHeight,0)+'}';
			}
			if (pr.displayFlexBox && pr.displayFlexBoxWidth){
				extraStyle += ' .'+objectCSSid +' .sfe {flex-basis:'+checkUserCSSstyle2(pr.displayFlexBoxWidth,0)+'}';
			}
			/*if (layout.props.specialFontcolor){
				articleElement.css('color',layout.props.specialFontcolor);
			} else {
				articleElement.css('color','');
			}*/
			//left padding in one qlik theme
			if(pr.leftpadding && pr.leftpadding != '-'){
				articleInnerElement.css('padding-left',pr.leftpadding+'px');
			}
			if(pr.rightpadding && pr.rightpadding != '-'){
				articleInnerElement.css('padding-right',pr.rightpadding+'px');
			}
			if(pr.bottompadding && pr.bottompadding != '-'){
				articleInnerElement.css('padding-bottom',pr.bottompadding+'px');
			}
			if (visType=='select2'){
				if (pr.select2hoverBGcolor){
					extraStyle += ' .select2-results__option--highlighted[aria-selected] { background-color: '+pr.select2hoverBGcolor+'!important;}';
				}
				if (pr.select2hoverFontcolor){
					extraStyle += ' .select2-results__option--highlighted[aria-selected] { color: '+pr.select2hoverFontcolor+'!important; }';
				}
			}
			if (pr.color_hoverFont){
				extraStyle += '.'+objectCSSid + ' .sfe:hover {color:'+pr.color_hoverFont+'!important; transition: 0.2s;}';
			}
			if (pr.color_hoverBG){
				extraStyle += '.'+objectCSSid + ' .sfe:hover {background-color:'+pr.color_hoverBG+'!important; transition: 0.2s;}';
			}
			if (pr.customHoverCSS){
				extraStyle += '.'+objectCSSid + ' .sfe:hover {'+checkUserCSSstyle2(pr.customHoverCSS)+'}';
			}
			if (extraStyle){
				html += '<style>'+extraStyle+'</style>';
			}

			//padding
			var paddingDivAdded = 1;
			var containerDivHeight_reduce = 0;
			if (pr.helptext){
				containerDivHeight_reduce += 19; //approximantion px amount of help text size
			}
			
			//extra label
			if(pr.inlinelabeltext){
				html += '<label class=inlinelabel><div class="inlinelabeldiv';
				if (pr.inlinelabelSetinline){
					html += ' inlinelabeldivInline';
					containerDivHeight_reduce += 2;
				} else {
					containerDivHeight_reduce += 22;
				}
				html += '"';
				if (pr.inlinelabelcss){
					html += ' style="'+checkUserCSSstyle2(pr.inlinelabelcss,1)+'"'
				}
				html += '>'+pr.inlinelabeltext+'</div> ';
				html += '</label>';
				
			}
			if(pr.enablesearch){
				if((visType=='hlist' || visType=='vlist' || visType=='checkbox' ||visType=='radio' || visType=='luiswitch' || visType=='luicheckbox' || visType=='luiradio')){
				var searchId = 'se'+layout.qInfo.qId;
				html += '<div class="sfssearchdiv">';
				html += '<div class="lui-search">';
				html += '<span class="lui-icon lui-search__search-icon"></span>';
				html += '<input class="lui-search__input sfssearchinput" id="'+searchId+'" maxlength="255" spellcheck="false" type="text" placeholder="Search"/>';
				html += '<span id="cl'+searchId+'" class="lui-icon lui-search__clear-icon sfssearchinput_clear" title="clear search"></span>';
				html += '</div></div>';
				html += '<div class="sfssearchIcon"><span class="lui-icon lui-icon--search"></span></div>';
				}
			}
			//content heigth
			if(pr.contentpadding && pr.contentpadding != '-'){
				containerDivHeight_reduce += (parseInt(pr.contentpadding)*2); //add padding to height reduce x 2
				html += '<div style="padding:'+pr.contentpadding +'px; height:calc(100% - '+containerDivHeight_reduce+'px); min-height:50%;">';
			} else {
				html += '<div style="height:calc(100% - '+containerDivHeight_reduce+'px); min-height:50%;">';
			}
			//change for mobile
			if ($('.smallDevice').length >0){ //$(window).width()<600
				var parent = $element.closest('.qv-gridcell');
				//console.log(parent.html());
				if(pr.mobileRemoveZoom){
					parent.find('.transparent-overlay').remove(); //remove mobile zoom haveto
				}
				//set height, default is too high
				if(pr.mobileCustomHeightCSS && pr.mobileCustomHeightCSS != ''){
					parent.css('height',pr.mobileCustomHeightCSS);
				} else {
					parent.css('height','65px');
				}
			}
			if(pr.removeFullScrnBtn){
				var objectwrapper = articleElement.parent().parent();
				objectwrapper.find('a.lui-icon--expand').remove();
			}
			//hiding, global or local..
			if (pr.hideFieldsFromSelectionBar || pr.hideFromSelectionsBar){
				//add hide area if needed
				if ($(".sfshideselstyles").length>0){
					
				} else {
					$('.qv-selections-pager').append('<div style="display:none;" class="sfshideselstyles"></div>');
				}
				//hide global
				if (pr.hideFieldsFromSelectionBar && pr.hideFieldsFromSelectionBar != ''){
					var splittedfields = pr.hideFieldsFromSelectionBar.split(";");
					if (debug){ console.log('hiding fields:'); console.log(splittedfields); }
					splittedfields.forEach(function(fieldToHide,i){
						var fieldToHideSelector = fieldToHide.replace(/ /g,'_').replace(/=/g,'');
						if (fieldToHideSelector){
							if ($('#hid'+fieldToHideSelector).length>0){
							//already hidden
							} else {
								$('.sfshideselstyles').append('<style id="hid'+fieldToHideSelector+'">.qv-selections-pager li[data-csid="'+ fieldToHide +'"] {display:none;}</style>');
							}
						}
					});
				}
				//hide current
				if (pr.hideFromSelectionsBar){
					var fieldToHide = pr.hideFromSelectionRealField;
					if (fieldToHide == '' || !fieldToHide){
						fieldToHide = layout.qListObject.qDimensionInfo.qGroupFieldDefs[0]; //try this one if not defined.
						if (fieldToHide.slice(0,1)==='='){ //if first letter =
							fieldToHide = fieldToHide.slice(1);
						}
						fieldToHide = fieldToHide.replace(/[\[\]']+/g,''); //reomve []
					}
					var fieldToHideSelector = fieldToHide.replace(/ /g,'_').replace(/=/g,'');
					if (fieldToHideSelector){
						if ($('#hid'+fieldToHideSelector).length>0){
							//already hidden
						} else {
							$('.sfshideselstyles').append('<style id="hid'+fieldToHideSelector+'">.qv-selections-pager li[data-csid="'+ fieldToHide +'"] {display:none;}</style>');
						}
					}
				}
			}
			//Globals CSS mod
			if (pr.enableGlobals){
				if(debug) console.log('enabled globals ' + layout.qInfo.qId);
				var sfsglobalCSSid = "SFSglobalCSS"+layout.qInfo.qId;
				if ($("#"+sfsglobalCSSid).length>0){
				} else {
					articleElement.append($( '<div id="'+sfsglobalCSSid+'" style="display:none;" class="sfsglobalcss"></div>' ));
				}
				if( $(".sfsglobalcss").length>1 ){
					console.log('SimpleFieldSelect: This sheet has two or more global modifications enabled. Remove others.');
				}
				$("#"+sfsglobalCSSid).html('<style>' + createglobalCSS(pr) + '</style>');
				if (pr.hideSheetTitle){
					$(".sheet-title-container").hide();
				} else {
					if(pr.removeSheetTitlePadding){
						$(".sheet-title-container").css('padding','0');
					}
					if(pr.sheetTitleheight && pr.sheetTitleheight != -1){
						$(".sheet-title-container").css('height',pr.sheetTitleheight +'px');
						$("#sheet-title").css('height',pr.sheetTitleheight +'px');
					}
					if(pr.sheetTitleFontSize && pr.sheetTitleFontSize != -1){
						$("#sheet-title").css('font-size',pr.sheetTitleFontSize +'px');
					}
					if(pr.sheetTitleExtraText && pr.sheetTitleExtraText != ''){
						if ($("#sfsSheetTitleTxt").length==0){
							$("#sheet-title").append('<div id="sfsSheetTitleTxt" style="margin-left:20px;"></div>');
						}
						$("#sfsSheetTitleTxt").html(pr.sheetTitleExtraText);
					}
				}
				if (pr.hideSelectionBar){
					$(".qvt-selections").hide();
				} else {
					if(pr.selBarExtraText && pr.selBarExtraText != ''){
						if ($("#sfsSelBartxt").length==0){
							$(".qv-selections-pager .buttons-end").append('<div id="sfsSelBartxt" class="item qv-object-SimpleFieldSelect qv-subtoolbar-button borderbox bright"></div>');
						}
						$("#sfsSelBartxt").html(pr.selBarExtraText).prop('title',pr.selBarExtraText).prop('style',pr.selBarExtraTextcss);
						if (pr.selBarExtraTextQlikStyle){
							$("#sfsSelBartxt").addClass('selbarqlikstyle');
						} else {
							$("#sfsSelBartxt").removeClass('selbarqlikstyle');
						}
					}
				}
				if(pr.toolbarheight && !pr.hideGuiToolbar && pr.toolbarheight != -1){
					if($(".qui-toolbar").length>0){
						$(".qui-toolbar").css('height',pr.toolbarheight +'px'); //pre 2019 feb
					} else {
						$(".qs-toolbar").css('height',pr.toolbarheight +'px');
					}
					
				}
				if(pr.keepaliver && pr.keepaliver>0){
					setKeepaliver(self,pr.keepaliver);
				}
			} //globals
			//get variable value(s)
			var varvalue = '', varvalues = {};
			if (pr.dimensionIsVariable){
				varvalue = layout.variableValue;
				if (debug){ console.log('varvalue from '+pr.variableName+' is '); console.log(varvalue); }
				if (pr.varMultiselectAllow){// && typeof varvalue !=='undefined' && !pr.variableIsDate && !visType=='input' && typeof pr.varMultiselectSep !== 'undefined'){
					var splittedvar  = varvalue.split(pr.varMultiselectSep);
					splittedvar.forEach(function(val){
						varvalues[val] = 1; //collect selected
					});
				}
			}
			var fontStyleTxt = '';
			if (pr.customFontCSS && pr.customFontCSS != ''){
				fontStyleTxt += ' font:'+checkUserCSSstyle2(pr.customFontCSS, 1);
			}
			if (pr.customFontFamilyCSS && pr.customFontFamilyCSS != ''){
				fontStyleTxt += ' font-family:'+checkUserCSSstyle2(pr.customFontFamilyCSS,1);
			}
			var elementStyleCSS = '';
			if (pr.customStyleCSS && pr.customStyleCSS != ''){
				elementStyleCSS = ' '+checkUserCSSstyle2(pr.customStyleCSS,1);
			}
			var containerStyles = '';
			if (pr.useMaxHeight){
				if (visType=='input'){
					containerStyles += ' height:calc(100% - 10px);';
				} else {
					containerStyles += ' height:100%;';
				}
				//headerelement.parent().css('padding-bottom','0px');
			}
			if (pr.textHAlign && pr.textHAlign != '-'){
				containerStyles += ' text-align:'+pr.textHAlign+';';
			}
			if (pr.textVAlign && pr.textVAlign != '-'){
				elementStyleCSS += ' vertical-align:'+pr.textVAlign+';';
			}
			var elementExtraAttribute = '';
			if (pr.customElementAttribute && pr.customElementAttribute != ''){
				elementExtraAttribute = ' '+pr.customElementAttribute+' ';
			}
			var elementExtraClass = '';
			if (pr.customElementClass && pr.customElementClass != ''){
				elementExtraClass = ' '+pr.customElementClass+' ';
			}
			var fontsizechanges = '';
			if (pr.responsivefontsize){
				fontsizechanges = ' font-size:'+pr.responsivefontvalue + pr.responsivefonttype+';';
			} else if (pr.fixedfontsize){
				fontsizechanges = ' font-size:'+pr.fixedfontsizevalue +'px;';
			} else if (pr.fontsizeChange && pr.fontsizeChange != '' && pr.fontsizeChange != '100'){
				fontsizechanges = ' font-size:'+pr.fontsizeChange+'%;';
			}
			//border color style
			var bordercolorstyle = '';
			if (pr.color_border && pr.color_border != ''){
				bordercolorstyle = ' border-color:'+pr.color_border+';';
			}
			var elementpadding = '';
			if (pr.elementpadding && pr.elementpadding != '' && pr.elementpadding != '-'){
				elementpadding = ' padding:'+pr.elementpadding+'px;';
			}
			var elementmargin = '';
			if (pr.elementmargin && pr.elementmargin != '' && pr.elementmargin != '-'){
				elementmargin = ' margin:'+pr.elementmargin+'px;';
			}
			var titletext = '';
			if (pr.hovertitletext && pr.hovertitletext != ''){
				titletext += pr.hovertitletext.replace(/\"/g,'&quot;');
			}
			var displayFlexBoxClass = '';
			if (pr.displayFlexBox){
				displayFlexBoxClass = ' flexboxcont';
			}
			//if date select to variable
			if (pr.variableIsDate && pr.dimensionIsVariable){
				if ($("#sfsdatepicker").length>0){
					//ok
				} else {
					$( "<style id=sfsdatepicker>" ).html( cssDatepick ).appendTo( "head" ); //add css.
				}
				if (pr.variableName){
					if (debug){ console.log('varvalue ' + pr.variableName); console.log(app.variable.getContent(pr.variableName)); }
					var inattributes = 'type=text';
					if(pr.visInputNumberMin != ''){
						inattributes += ' min="'+pr.visInputNumberMin+'"';
					}
					if(pr.visInputNumberMax != ''){
						inattributes += ' max="'+pr.visInputNumberMax+'"';
					}
					if (pr.preElemHtml){
						html += pr.preElemHtml;
					}
					html += '<div class="checkboxgroup '+objectCSSid+'">';
					html += '<input '+inattributes+' title="';
					if (titletext != ''){
						html += titletext; //escape quotas!!
					} else {
						html += 'Click to select date';
					}
					html += '" class="sfe pickdate'+elementExtraClass+createLUIclass(pr.addLUIclasses,'input','text')+'" ';
					if (pr.visInputPlaceholdertxt && pr.visInputPlaceholdertxt != ''){
						html += ' placeholder="'+pr.visInputPlaceholdertxt.replace(/\"/g,'&quot;')+'"'; //escape quotas!!
					}
					if (pr.color_stateO_bg && pr.color_stateO_bg != ''){
						elementStyleCSS += 'background-color:'+pr.color_stateO_bg+';';
					}
					if (pr.color_stateO_fo && pr.color_stateO_fo != ''){
						elementStyleCSS += ' color:'+pr.color_stateO_fo+';';
					}
					//no multivar support here
					html += 'value="'+varvalue+'" style="width:6em; max-width:80%;'+fontsizechanges+fontStyleTxt+elementStyleCSS+bordercolorstyle+elementpadding+elementmargin+'"' +elementExtraAttribute+ '/>';
					if (pr.postElemHtml){
						html += pr.postElemHtml;
					}
					if (pr.helptext){
						html += createhelptextdiv(pr);
					}
					html += '</div>';
					if(paddingDivAdded) html += '</div>';

					$element.html( html );
					//set javascript
					var datepickElement = $element.find( '.pickdate' );
					datepickElement.datepicker({
						dateFormat: pr.dateformat,
						changeMonth: true,
						changeYear: true,
						showOn: "both",
						maxDate: pr.visInputNumberMax,
						minDate: pr.visInputNumberMin,
						firstDay:1,
						constrainInput: true
					});
					 //dates limited? will be depricated
					if (pr.maxLimitvariable && pr.maxLimitvariable && pr.maxLimitvariable != '-'){
						if (debug){ console.log('Limiting days to '); console.log(pr.maxLimitvariable); }
						var parsedDate = $.datepicker.parseDate(pr.dateformat, pr.maxLimitvariable);
						datepickElement.datepicker( "option", "maxDate", parsedDate );
					}
					$element.find( '.pickdate' ).on( 'change', function () {
						var newval = $(this).val();
						if(debug) console.log('NEW '+newval + ' to '+pr.variableName);
						app.variable.setStringValue(pr.variableName, newval);
					});
				}
			//html input for variable
			} else if (visType=='input' && !pr.variableIsDate) {
				var datalist = '', datalistID='';
				if (pr.color_stateO_bg && pr.color_stateO_bg != ''){
					elementStyleCSS += 'background-color:'+pr.color_stateO_bg+';';
				}
				if (pr.color_stateO_fo && pr.color_stateO_fo != ''){
					elementStyleCSS += ' color:'+pr.color_stateO_fo+';';
				}
				if (!pr.dimensionIsVariable){
					html += 'HTML input option is available only for variables';
				} else {
					//if stepped, datalist values
					var splitted = pr.variableOptionsForValues.split(";");
					var splittedkeys = pr.variableOptionsForKeys.split(";");
					if(splitted && pr.variableOptionsForValues != ''){
						datalistID = 'dl'+layout.qInfo.qId;
						datalist = ' <datalist id="'+datalistID+'">';
						
						splitted.forEach(function(opt,i){
							var label = opt;
							if(typeof splittedkeys[i] !== 'undefined'){
								label = splittedkeys[i];
							}
							datalist += '<option label="'+label+'">'+opt+'</option>';
						});
						datalist += '</datalist> ';
					}
					var inattributes = 'type='+pr.visInputFieldType;
					if(pr.visInputFieldType!='text' && pr.visInputFieldType!='password'){
						if(pr.visInputNumberMin != ''){
							inattributes += ' min="'+pr.visInputNumberMin+'"';
						}
						if(pr.visInputNumberMax != ''){
							inattributes += ' max="'+pr.visInputNumberMax+'"';
						}
						if(pr.visInputNumberStep != ''){
							inattributes += ' step="'+pr.visInputNumberStep+'"';
						}
					}
					//build html
					html += '<div class="checkboxgroup '+objectCSSid+'">';
					if (pr.preElemHtml){
						html += pr.preElemHtml;
					}
					html += '<input '+inattributes+' title="';
					//no multivar support here
					if(pr.visInputFieldType=='range') html += varvalue+' ';
					if (titletext != ''){
						html += titletext; //escape quotas!!
					}
					html += '"';
					if (datalist) html += ' list="'+datalistID+'"';
					if (pr.visInputPlaceholdertxt && pr.visInputPlaceholdertxt != ''){
						html += ' placeholder="'+pr.visInputPlaceholdertxt.replace(/\"/g,'&quot;')+'"'; //escape quotas!!
					}
					html += ' class="sfe htmlin '+createLUIclass(pr.addLUIclasses,visType,pr.visInputFieldType)+elementExtraClass+'" value="'+varvalue+'" style="'+fontsizechanges+fontStyleTxt+elementStyleCSS+bordercolorstyle+elementpadding+elementmargin+containerStyles+'"' +elementExtraAttribute+ '/>';
					if (pr.postElemHtml){
						html += pr.postElemHtml;
					}
					if (datalist) html += datalist;
					if(pr.visInputFieldType=='range'){
						if(pr.visInputRangeSliderValuefield){
							html += '<output class="rangval" id="rv_'+layout.qInfo.qId+'">'+varvalue+'</output>';
						}
						//tooltip
						html += '<div class="rangvaltooltip" style="display:none;" id="tip_'+layout.qInfo.qId+'">'+varvalue+'</div>';
					}
					if (pr.helptext){
						html += createhelptextdiv(pr);
					}
					html += '</div>';
					if(paddingDivAdded) html += '</div>';

				}
				$element.html( html );
				$element.find( '.htmlin' ).on( 'change select', function () { //select for datalist
					var newval = $(this).val();
					if (newval != layout.variableValue){
						if(debug) console.log('NEW '+newval + ' to '+pr.variableName);
						app.variable.setStringValue(pr.variableName, newval);
					}
				});
				//range actions
				if(pr.visInputFieldType=='range'){
					var targetelement = $element.find( '.htmlin' );
					var tooltip = $("#tip_"+layout.qInfo.qId);
					targetelement[0].oninput = function(e){ //jquery doesn't support oninput
						$("#rv_"+layout.qInfo.qId).html(this.value);
						tooltip.html(this.value);
					};
					targetelement.mousedown(function(e){
						tooltip.css({'position':'fixed','top':(e.pageY-35),'left':(e.pageX+5)}).show();
						targetelement.on('mousemove',function(e){
							tooltip.css({'top':(e.pageY-30),'left':(e.pageX+5)})
						});
					});
					targetelement.mouseup(function(){
						targetelement.off('mousemove');
						tooltip.fadeOut('slow');
					});
					/* for jquery slider....
					var handle = $( "#custom-handle" );
					$element.find('#slider').slider({
						slide: function( event, ui ) {
        					alert( ui.value );
        					handle.text( ui.value );
      					}
					});*/
				}
			//only txt
			} else if(visType=='txtonly'){
				if (pr.preElemHtml){
					html += pr.preElemHtml;
				}
				html += '<div class="'+objectCSSid+' sfe txtonly '+elementExtraClass+displayFlexBoxClass+'"';
				if (titletext){
					html += ' title="'+titletext+'"'; //escape quotas!!
				}
				html += ' style="'+fontsizechanges+fontStyleTxt+elementStyleCSS+bordercolorstyle+elementpadding+elementmargin+containerStyles+checkUserCSSstyle2(pr.textareaonlyCSS,1)+'"' +elementExtraAttribute+'>';
				if (pr.textareaonlytext) html += pr.textareaonlytext;
				if (pr.textareaonlytext2) html += pr.textareaonlytext2;
				if (pr.helptext){
						html += createhelptextdiv(pr);
					}
				html += '</div>';
				if (pr.postElemHtml){
					html += pr.postElemHtml;
				}
				$element.html( html );
			//not date or html input:
			} else {
				var visTypedropdownOrSelect2 = visType=='dropdown' || visType=='select2';
				var stylechanges = fontsizechanges+fontStyleTxt+containerStyles;
				if(visType=='luiswitch' || visType=='luicheckbox' || visType=='luiradio'){
					html += '<div class="sfs_lui '+objectCSSid+displayFlexBoxClass+'" style="'+stylechanges+'"';
				} else {
					html += '<div class="checkboxgroup '+objectCSSid+'"';
				}
				if (titletext){
					html += ' title="'+titletext+'"'; //escape quotas!!
				}
				html += '>';
				var countselected = 0;
				var multiselect = ''; //dropdown multi
				if (visTypedropdownOrSelect2 && pr.selectmultiselect && !(pr.dimensionIsVariable && !pr.varMultiselectAllow)) {
					multiselect = ' multiple="multiple"';
					elementExtraClass = ' ddmulti '+elementExtraClass;
				}
				var mainobjectstyle = '';
				if (pr.mainobjectwidth){
					mainobjectstyle += ' width:'+pr.mainobjectwidth;
				}
				
				if (visType=='vlist'){
					html += '<ul style="'+stylechanges+'" class="vlist">';
				}else if (visType=='hlist'){
					var roundcornerClass=' rcorners';
					if (pr.hlistRoundedcorners===false){
						roundcornerClass='';
					}
					var rmarginclass = ' rmargin1';
					if (pr.hlistMarginBetween >= 0){ //its defined
						rmarginclass = ' rmargin'+pr.hlistMarginBetween;
					}
					var displayastableClass = '';
					if (pr.hlistShowAsTable){
						displayastableClass = ' ulastable';
					}
					html += '<ul class="horizontal'+roundcornerClass+rmarginclass+displayastableClass+displayFlexBoxClass+'" style="'+stylechanges+'">';
				} else if (visType=='checkbox' || visType=='radio'){
					html += '<div class="'+displayFlexBoxClass+'" style="'+stylechanges+'">';
				} else if (visType=='dropdown'){
					if (pr.preElemHtml){
						html += pr.preElemHtml;
					}
					html += '<select class="dropdownsel'+elementExtraClass+createLUIclass(pr.addLUIclasses,visType,'')+'" style="'+fontsizechanges+fontStyleTxt+elementStyleCSS+bordercolorstyle+elementpadding+elementmargin+containerStyles+mainobjectstyle+'"' +elementExtraAttribute+multiselect+ '>';
				} else if (visType=='select2'){
					if (pr.preElemHtml){
						html += pr.preElemHtml;
					}
					html += '<select class="dropdownsel'+elementExtraClass+createLUIclass(pr.addLUIclasses,visType,'')+'" style="'+fontsizechanges+fontStyleTxt+elementStyleCSS+bordercolorstyle+containerStyles+mainobjectstyle+'"' +elementExtraAttribute+multiselect+ '>'; //no elementpadding/margin
				} else if (visType=='btn'){
					html += '<div class="'+displayFlexBoxClass+'" style="'+stylechanges+'">';
				} else if (visType=='luiswitch' || visType=='luicheckbox' || visType=='luiradio'){

				} else {
					html += 'Select visualization type';
				}
				//print elements
				var optionsforselect = [];
				if (pr.dimensionIsVariable){
					//generate variable options from field
					if (debug) console.log('variable value '+varvalue);
					if (debug && pr.varMultiselectAllow) {console.log('paint multivalues'); console.log(varvalues); }
					if (!pr.variableOptionsForValues){
						html += 'Set variable options or enable date selector or switch to HTML standard input visualization';
					}
					if (pr.variableName =='' || !pr.variableName){
						html += ' <br /> Invalid variable name.';
					}

					//create lists for variable values
					var splitted = pr.variableOptionsForValues.split(";");
					var varindex = 0; //index is used to access variable
					
					sfssettings.variableOptionsForValuesArray = [];
					sfssettings.variableOptionsForKeysArray = [];
					splitted.forEach(function(opt){
						var qState = 'O';
						//if values match with current, mark selected
						if (pr.varMultiselectAllow){
							if (typeof varvalues[opt] !== 'undefined' && varvalues[opt]==1){
								qState = 'S'; 
							}
						} else if (varvalue == opt) {
							qState = 'S'; 
						} //build qlik style object for printing
						optionsforselect.push( [{qState:qState, qText:opt, qElemNumber:varindex}] );
						sfssettings.variableOptionsForValuesArray.push(opt); //when setting variable, take value from here.
						varindex += 1;
					});
					if (debug){ console.log(pr.variableOptionsForValues); }
					//if separate Keys variable is defined:
					var varKeyindex = 0;
					if (pr.variableOptionsForKeys != ''){
						splitted = pr.variableOptionsForKeys.split(";");
						splitted.forEach(function(opt){
							sfssettings.variableOptionsForKeysArray.push(opt); //when setting variable, take value from here.
							varKeyindex += 1;
						});
						if (varindex != varKeyindex){
							console.log('variable values and key options do not match. Values: '+varindex + ' vs. keys: '+varKeyindex);
							sfssettings.variableOptionsForKeysArray = []; //reset array
						}
					}
					
				//if not variable:
				} else {
					optionsforselect = matrixdata;
				}
				//dropdown default option
				if ((visTypedropdownOrSelect2) && !pr.selectmultiselect && pr.dropdownValueForNoSelect && pr.dropdownValueForNoSelect != ''){
					html += '<option class="state0" dval="" value="">' + pr.dropdownValueForNoSelect;
					html += '</option>';
				}
				//fetch other default values
				var otherDefaultValues = [];
				if (!pr.selectOnlyOne && pr.selectAlsoThese && pr.selectAlsoThese != '' && !pr.dimensionIsVariable &&
						visType!='dropdown' && visType!='btn' && visType!='radio'){
					otherDefaultValues = pr.selectAlsoThese.split(";");
					//console.log(otherDefaultValues);
				}
				//forced values
				var forcedValues = [];
				if (pr.ForceSelections && pr.ForceSelections != ''){
					forcedValues = pr.ForceSelections.split(";");
				}
				
				//special case, calc selected
				var calcSelected = 0;
				if (pr.showOnlySelectedItems && pr.showOnlySelectedItemsShowPossible){
					if (debug) console.log('calc selected');
					optionsforselect.forEach( function ( row ) {
						if (row[0].qState === 'S'){
							calcSelected = calcSelected+1;
						}
					});
				}

				//paint options
				optionsforselect.forEach( function ( row ) {
					if (pr.hidePassiveItems && !pr.dimensionIsVariable && row[0].qState === 'X'){ //if passive hiding enabled
						return; //exit current function
					}
					if (pr.showOnlySelectedItems && !pr.dimensionIsVariable){
						if (pr.showOnlySelectedItemsShowPossible && calcSelected ==0){
							//ok, some selected, do not show
							if(row[0].qState !== 'O'){
								return;
							}
						} else {
							if(row[0].qState !== 'S'){
								return;
							}
						}
					}
					if(pr.removeLabel){
						row[0].qText = '';
					}
					
					var defaultelementclass = '',checkedstatus = '',dis = '', selectedClass = '', dropselection = '', otherdefaultelementclass = '';
					if (row[0].qState === 'S') { 
						checkedstatus = ' checked'; 
						countselected += 1;
						selectedClass = ' selected';
						dropselection = ' selected';
					}
					//if only one, but somewhere already selected... deselect rest. And if not variable
					if (pr.selectOnlyOne && !pr.dimensionIsVariable && countselected > 1){
						if (debug) console.log('Select only one enabled, reducing selections.');
						checkedstatus = ''; selectedClass = ''; dropselection = '';
						if (visTypedropdownOrSelect2){
						  //self.backendApi.selectValues( 0, [ row[0].qElemNumber ], false );
						  selectValueInQlik(self,row[0].qElemNumber,layout,app,false,$element,sfssettings);
						} else {
						  //self.backendApi.selectValues( 0, [ row[0].qElemNumber ], false );
						  selectValueInQlik(self,row[0].qElemNumber,layout,app,false,$element,sfssettings);
						}
						countselected -= 1; //reduce one because deselected
					}

					//mark defaultvalue
					if (pr.allwaysOneSelectedDefault != '' && row[0].qText == pr.allwaysOneSelectedDefault) {
						defaultelementclass = " defaultelement";
					}
					//mark forced
					if (forcedValues){
						if(forcedValues.indexOf(row[0].qText) > -1){
							defaultelementclass += " forcedelem";
						}
					}
					//mark other default values
					if (otherDefaultValues){
						if (otherDefaultValues.indexOf(row[0].qText) > -1){
							otherdefaultelementclass = " otherdefelem";
						}
					}
					
					var colorclasses = '', elementstyle = '';
					//color selections
					if (row[0].qState === 'S'){
						//set special color if set
						if (pr.color_stateS_bg && pr.color_stateS_bg != ''){
							colorclasses += ' disableBGimage';
							elementstyle += ' background-color:'+pr.color_stateS_bg+';';
						}
						//font color
						if (pr.color_stateS_fo && pr.color_stateS_fo != ''){
							elementstyle += ' color:'+pr.color_stateS_fo+';';
						}
					} else if (row[0].qState === 'O'){
						if (pr.color_stateO_bg && pr.color_stateO_bg != ''){
							elementstyle += ' background-color:'+pr.color_stateO_bg+';';
						}
						if (pr.color_stateO_fo && pr.color_stateO_fo != ''){
							elementstyle += ' color:'+pr.color_stateO_fo+';';
						}
					} else if (row[0].qState === 'X'){
						if (pr.color_stateX_bg && pr.color_stateX_bg != ''){
							elementstyle += 'background-color:'+pr.color_stateX_bg+';';
						}
						if (pr.color_stateX_fo && pr.color_stateX_fo != ''){
							elementstyle += ' color:'+pr.color_stateX_fo+';';
						}
					} else if (row[0].qState === 'A'){
						if (pr.color_stateA_bg && pr.color_stateA_bg != ''){
							elementstyle += ' background-color:'+pr.color_stateA_bg+';';
						}
						if (pr.color_stateA_fo && pr.color_stateA_fo != ''){
							elementstyle += ' color:'+pr.color_stateA_fo+';';
						}
					}
					elementstyle += bordercolorstyle+elementStyleCSS+elementpadding+elementmargin;
					if (elementstyle){
						elementstyle = ' style="' + elementstyle + '" ';
					}
					
					if (!visTypedropdownOrSelect2 && pr.preElemHtml){
						html += pr.preElemHtml;
					}
					//list
					if (visType=='hlist' || visType=='vlist'){
						html += '<li class="sfe data '+selectedClass+defaultelementclass+otherdefaultelementclass+colorclasses+' state' + row[0].qState + ''+elementExtraClass+createLUIclass(pr.addLUIclasses,visType,pr.visInputFieldType)+'" dval="' + row[0].qElemNumber + '"'+elementstyle+' ' +elementExtraAttribute+ '>' + row[0].qText;
						html += '</li>';
					//checkbox
					} else if (visType=='checkbox'){
						html += '<label'+elementstyle+' class="sfe">'
						html += '<input type="checkbox" class=" data state' + row[0].qState +defaultelementclass+otherdefaultelementclass+selectedClass+elementExtraClass+colorclasses+createLUIclass(pr.addLUIclasses,visType,pr.visInputFieldType)+ '" dval="' + row[0].qElemNumber + '"' + dis + checkedstatus +' ' +elementExtraAttribute+ '/> ' + row[0].qText; //
						html += '</label>';
					//button
					} else if (visType=='btn'){
						html += '<button'+elementstyle+''
						html += ' class="sfe sfsbtn state' + row[0].qState +defaultelementclass+selectedClass+colorclasses+elementExtraClass+otherdefaultelementclass+ createLUIclass(pr.addLUIclasses,visType,pr.visInputFieldType)+'" dval="' + row[0].qElemNumber + '"' + dis + ' ' +elementExtraAttribute+ '>' + row[0].qText; //
						html += '</button> ';
					//radio
					} else if (visType=='radio'){
						html += '<label'+elementstyle+' class="sfe">'
						html += '<input type="radio" name="sfs'+layout.qInfo.qId+'" class="state' + row[0].qState +defaultelementclass+elementExtraClass+otherdefaultelementclass+selectedClass+colorclasses+ '" dval="' + row[0].qElemNumber + '"' + dis + checkedstatus +' ' +elementExtraAttribute+ '/>' + row[0].qText; //
						html += '</label>';
					} else if (visTypedropdownOrSelect2){
						html += '<option '+elementstyle+'class="data state' + row[0].qState +defaultelementclass+otherdefaultelementclass+selectedClass+colorclasses+ '" dval="' + row[0].qElemNumber + '" value="' + row[0].qElemNumber + '"' + dis + dropselection + ' >' + row[0].qText;
						html += '</option>';
					} else if (visType=='luiswitch'){
						html += '<div '+elementstyle+' class="sfe lui-switch" title="'+row[0].qText+'"> <label class="lui-switch__label">';
						html += '<input type="checkbox" class="data lui-switch__checkbox state' + row[0].qState +defaultelementclass+elementExtraClass+otherdefaultelementclass+selectedClass+colorclasses+createLUIclass(pr.addLUIclasses,visType,pr.visInputFieldType)+ '" dval="' + row[0].qElemNumber + '"' + dis + checkedstatus +' ' +elementExtraAttribute+ '/> ';
						html += '<span class="lui-switch__wrap"><span class="lui-switch__inner"></span><span class="lui-switch__switch"></span></span></label>';
						html += '<div class="lui-switch_txt" style="">'+row[0].qText+'</div>';
						html += '</div>';
					} else if (visType=='luicheckbox'){
						html += '<label '+elementstyle+' class="sfe lui-checkbox" title="'+row[0].qText+'">';
						html += '<input type="checkbox" class="data lui-checkbox__input state' + row[0].qState +defaultelementclass+elementExtraClass+otherdefaultelementclass+selectedClass+colorclasses+createLUIclass(pr.addLUIclasses,visType,pr.visInputFieldType)+ '" dval="' + row[0].qElemNumber + '"' + dis + checkedstatus +' ' +elementExtraAttribute+ '/> ';
						html += '<div class="lui-checkbox__check-wrap"> <span class="lui-checkbox__check"></span> <span '+elementstyle+' class="lui-checkbox__check-text">' + row[0].qText+'</span> </div>';
						html += '</label>';
					} else if (visType=='luiradio'){
						html += '<label '+elementstyle+' class="sfe lui-radiobutton" title="'+row[0].qText+'">';
						html += '<input type="radio" name="sfs'+layout.qInfo.qId+'" class="data lui-radiobutton__input state' + row[0].qState +defaultelementclass+elementExtraClass+otherdefaultelementclass+selectedClass+colorclasses+createLUIclass(pr.addLUIclasses,visType,pr.visInputFieldType)+ '" dval="' + row[0].qElemNumber + '"' + dis + checkedstatus +' ' +elementExtraAttribute+ '/> ';
						html += '<div class="lui-radiobutton__radio-wrap"> <span class="lui-radiobutton__radio"></span> <span '+elementstyle+' class="lui-radiobutton__radio-text">' + row[0].qText+'</span> </div>';
						html += '</label>';
					}
					
					if (!visTypedropdownOrSelect2 && pr.postElemHtml){
						html += pr.postElemHtml;
					}
				});
				if (visType=='hlist' || visType=='vlist'){
					html += '</ul>';
				}else if (visTypedropdownOrSelect2){
					html += '</select>';
					if (pr.postElemHtml){
						html += pr.postElemHtml;
					}
				}else if (visType=='checkbox' || visType=='btn' || visType=='radio'){
					html += '</div>';
				}
				html += '</div>';
				
				if (pr.helptext){
					html += createhelptextdiv(pr);
				}
				if(paddingDivAdded) html += '</div>';
				var showContextMenu = 0;
				if (pr.rightclikcmenu && !pr.dimensionIsVariable && (visType=='hlist' || visType=='vlist' || visType=='checkbox' || visType=='luicheckbox' || visType=='luiswitch' || (visTypedropdownOrSelect2 && pr.selectmultiselect) )) {
					showContextMenu = 1;
				}
				if (pr.rightclikcmenu_getselectionurl || pr.rightclikcmenu_getselurltoclipboard){
					showContextMenu = 1;
				}
				$element.html( html );
				//context menu actions
				if (showContextMenu){
					var sfsrmenu;
					var contextmenuID = 'sfsrmenu'+layout.qInfo.qId;
					if (debug) console.log('create context menu '+contextmenuID)
					$element.off("contextmenu"); //remove previous menuaction if exists, may not work
					if ($("."+contextmenuID).length>0){
						if (debug) console.log('context menu exists');
						//if properties change, menu should be rewritten.
						sfsrmenu = $("body").find('.'+contextmenuID);
						$(document).off("mousedown", hidermenu);
						sfsrmenu.find('li').off('click');
						$("."+contextmenuID).remove();
					}
					var contextmenuHtml = '<div class="qv-object-SimpleFieldSelect sfsrmenu '+contextmenuID+'"><ul>';
					if(pr.rightclikcmenu_selall) contextmenuHtml += '<li act="all">Select all</li>';
					if(pr.rightclikcmenu_clear) contextmenuHtml += '<li act="clear">Clear selections</li>';
					if(pr.rightclikcmenu_reverse) contextmenuHtml += '<li act="reverse">Reverse selection</li>';
					if(pr.rightclikcmenu_possible) contextmenuHtml += '<li act="possible">Select possible</li>';
					if(pr.rightclikcmenu_random) contextmenuHtml += '<li act="random">Select randomnly</li>';
					if(pr.rightclikcmenu_defaults) contextmenuHtml += '<li act="defaults">Select defaults</li>';
					if(pr.rightclikcmenu_copy)  contextmenuHtml += '<li act="copy">Copy values to clipboard</li>';
					//getselurl
					
					contextmenuHtml += '</ul></div>';
					$('body').append(contextmenuHtml);
					sfsrmenu = $("."+contextmenuID);
					if (debug) console.log('set contextmenu action on '+layout.qInfo.qId);
					//add icon trigger
					if (pr.rigthclickmenushowasicon){
						$element.off("click",".contextmenulaunch");
						var extracmclass = pr.enablesearch ? ' contextmenulaunchwithsearch' : '';
						$element.append('<div class="contextmenulaunch'+extracmclass+'" cm="'+contextmenuID+'" title="Show menu"><style></style><span class="lui-icon lui-icon--menu"></span></div>');
						if (debug) console.log('Add cntx menulaunch'+ $element.find(".contextmenulaunch").length);
						$element.on("click",".contextmenulaunch",showcontextmenuevent);
					}
					$element.off("contextmenu",$element, showcontextmenuevent);
					//right click trigger
					$element.on("contextmenu",$element, showcontextmenuevent);
					function showcontextmenuevent (event) {
						if (debug) console.log('show contextmenu '+contextmenuID);
						event.preventDefault();
						hidermenu(event); //if already
						sfsrmenu.finish().toggle(100).
							css({top: (event.pageY+20) + "px", left: event.pageX + "px"});
						
						sfsrmenu = $("."+contextmenuID);
						if (debug) console.log(sfsrmenu.find('li'));
						sfsrmenu.find('li').click(function(){
							var action = $(this).attr('act');
							if (debug) console.log('action:' +action);
							sfsrmenu.hide(100);
							sfsrmenu.find('li').off('click');
							var valuesToSelect = [];
							if (action=='getselectionurl'){
								getSelectedUrl('dialog');
							} else if (action=='getselectionurlclip'){
								getSelectedUrl('clipboard');
							} else if (action=='copy'){ //copy to clip
								//var selectorClass='data'; //choose all
								var dataelements = $element.find('.selected');
								var rowseparator = "\n";
								if (dataelements.length>0){ //some selected

								} else {
									dataelements = $element.find('.data'); //all
								}
								if (dataelements.length==1){
									rowseparator = '';
								}
								var tocopy = '';
								if (visType=='checkbox'){
									dataelements.each(function(){
										tocopy += $(this).parent().text() + rowseparator;
									});
								} else if (visType=='luicheckbox'){
									dataelements.each(function(){
										tocopy += $(this).parent().find('.lui-checkbox__check-text').text() + rowseparator;
									});
								} else if (visType=='luiswitch'){
									dataelements.each(function(){
										tocopy += $(this).parent().parent().find('.lui-switch_txt').text() + rowseparator;
									});
								} else {
									dataelements.each(function(){
										tocopy += $(this).text() + rowseparator;
									});
								}
								var txta = document.createElement("textarea");
								txta.value = tocopy;
								document.body.appendChild(txta);
								txta.select();
								document.execCommand("copy");
								document.body.removeChild(txta);
							} else {
							
								if (action=='all'){
									$element.find('.data').each(function(){
										valuesToSelect.push( parseInt($(this).attr( "dval" ),10) );
									});
									
								} else 
								if (action=='clear'){
									if (debug) console.log('clear selections');
								} else 
								if (action=='reverse'){
									$element.find('.data').each(function(){
										if (!$(this).hasClass('selected')){
											valuesToSelect.push( parseInt($(this).attr( "dval" ),10) );
										}
									});
								} else 
								if (action=='possible'){
									$element.find('.data').each(function(){
										if ($(this).hasClass('stateO')){
											valuesToSelect.push( parseInt($(this).attr( "dval" ),10) );
										}
									});
								} else 
								if (action=='random'){
									$element.find('.data').each(function(){
										if (Math.random()>=0.5){
											valuesToSelect.push( parseInt($(this).attr( "dval" ),10) );
										}
									});
								} else 
								if (action=='defaults'){
									$element.find('.data').each(function(){
										if ($(this).hasClass('defaultelement') || $(this).hasClass('otherdefelem')) {
											valuesToSelect.push( parseInt($(this).attr( "dval" ),10) );
										}
									});
								} else {
									return;
								}

								selectValuesInQlik(self, valuesToSelect ,layout,app,false,$element,sfssettings);
								return;
							}
						});
						$(document).on("mousedown", document, hidermenu);
					}
					function hidermenu(e){ //hide menu
						if (!$(e.target).parents("."+contextmenuID).length > 0) {
							//e.preventDefault();
							if (debug) console.log('menuhide '+contextmenuID);
							$(".sfsrmenu").hide(100);//.find('li').off('click'); //hide all
						}
						$(document).off('mousedown',hidermenu);
					}
				}
				
				//list action
				if (visType=='hlist' || visType=='vlist'){
					//todo, fix mobile "paint selection"
					var listtargets = $element.find( '.checkboxgroup li' );
					if (!pr.dimensionIsVariable){
						var isMouseDown = false, newselectionsDone = false;
						articleElement.off('mousedown touchstart').off('mouseup mouseleave touchend');
						//for mousedown select track mousedown
						articleElement.on('mousedown touchstart',function() {
	        				isMouseDown = true;
	        				if (debug) console.log('mouse down');
						});
						articleElement.on('mouseup mouseleave touchend',function() { //m up or leave element
							isMouseDown = false;
							if (debug) console.log('mouse up ');
							if (newselectionsDone == false){
								return;
							}
							var targets = $element.find(".selected");
							if (targets.length<1){
								return;
							}
							var valuesToSelect = [];
							targets.each(function(){
								var val = parseInt($(this).attr( "dval" ),10);
								if (!isNaN(val)){
									valuesToSelect.push( val );
								}
							});
							newselectionsDone = false;
							if (valuesToSelect != []){
								selectValuesInQlik(self, valuesToSelect ,layout,app,false,$element,sfssettings);
							}
						});
						/*listtargets.on( 'touchstart', function (e) {
							console.log(e);
						});*/
						//todo, fix mobile
						listtargets.on( 'mouseenter touchmove', function () {
							if(isMouseDown){
								if (!$(this).hasClass('selected')){
									if(debug) console.log('adding selectclass');
									newselectionsDone = true;
									$(this).addClass('selected').addClass('stateS').removeClass('stateA');
								}
							}
						});
					}
					//for first element
					/*listtargets.on('mousedown',function(event){
						//$(this).addClass('selthis').addClass('stateS').removeClass('stateA');
					});*/
					//normal click
					listtargets.on( 'qv-activate', function (ev) { //mouseenter
						var clicktarget = $(this);
						var targetValueID = parseInt(clicktarget.attr( "dval" ),10);
						if (debug) console.log('qv active on list change');

						if (!$(this).hasClass('selected')){
							if (debug) console.log('is not selected');
							if (pr.selectOnlyOne && !pr.dimensionIsVariable){
							  if (debug) console.log('removing selections');
							  $element.find( '.selected' ).each(function(){
								var value = parseInt( $(this).attr( "dval" ), 10 );
								if (value != targetValueID){
								  $(this).removeClass('selected');
								  selectValueInQlik(self,value,layout,app,true,$element,sfssettings);
								}
							  });
							}
							this.classList.toggle("selected");
							selectValueInQlik(self,targetValueID,layout,app,true,$element,sfssettings);
						//deselect, because selected already
						} else {
							if (pr.dimensionIsVariable && pr.variableEmptyAlreadySelected){ //for variable "clean"
								clicktarget.removeClass('selected');
								selectValueInQlik(self,targetValueID,layout,app,true,$element,sfssettings);
							} else {
								if (pr.dimensionIsVariable && !pr.varMultiselectAllow){
									if (debug) console.log('no selection change');
								} else {
									if (debug) console.log('de selecting');
									clicktarget.removeClass('selected');
									selectValueInQlik(self,targetValueID,layout,app,true,$element,sfssettings);
									var selectedCount = 0;
									$element.find( '.selected' ).each(function(){
									  selectedCount += 1;
									});
									checkDefaultValueSelection($element,selectedCount,layout,self,app,sfssettings);
								}
							}
						}
					} );
					
					
				} else
				//dropdown change
				if (visTypedropdownOrSelect2){
					var dropdownelem = $element.find( '.dropdownsel' );
					dropdownelem.attr('title', countselected + ' selected'  );
					dropdownelem.on('change',function(){
						if (debug) console.log('select change action');
						if (!layout.props.selectmultiselect){ //not multi
							var clicktarget = $(this).find(":selected");
							var targetValueID = parseInt(clicktarget.val(),10);
							$element.find( '.selected' ).each(function(){ //clear others
								var value = parseInt( $(this).val(), 10 );
								if (value != targetValueID){
								  selectValueInQlik(self,value,layout,app,true,$element,sfssettings);
								  $(this).removeClass('selected');
								}
							});
							clicktarget.addClass('selected').prop('selected',true);
							selectValueInQlik(self,targetValueID,layout,app,true,$element,sfssettings);
						} else { //multi
							var valuesToSelect = [];
							var targets = $(this).find(":selected");
							$element.find( '.selected' ).removeClass('selected');
							targets.each(function(){
								var val = parseInt($(this).val(),10);
								if (!isNaN(val)){
									valuesToSelect.push( val );
									$(this).addClass('selected');
								}
							});
							selectValuesInQlik(self, valuesToSelect ,layout,app,false,$element,sfssettings);
						}
					});
				} else
				//attach click event to checkbox
				if (visType=='checkbox' || visType=='luiswitch' || visType=='luicheckbox'){
				  $element.find( 'input' ).on( 'click', function () {
				  //self.backendApi.clearSelections();
					  if (debug) console.log('checkbox clicked action');
					  var clicktarget = $(this);
					  if ( $(this).attr( "dval" ) ) {
						  var targetValueID = parseInt(clicktarget.attr( "dval" ),10);
						  //when checking
						  if ($(this).is(':checked')){
							//if only one, clear others.
							if (layout.props.selectOnlyOne){
								$element.find( 'input:checked' ).each(function(){
									var value = parseInt( $(this).attr( "dval" ), 10 );
									if (value != targetValueID){
									  $(this).prop('checked',false).removeClass('selected');
									  selectValueInQlik(self,value,layout,app,true,$element,sfssettings);
									}
								});
							}
							clicktarget.addClass('selected'); //to var contorl
							selectValueInQlik(self,targetValueID,layout,app,true,$element,sfssettings);
						  //remove check from box
						  } else {
							  //deselect
							  if (debug) console.log('deselect');
							  clicktarget.prop('checked',false).removeClass('selected');
							  if (debug) console.log(clicktarget.attr("dval"));
							  selectValueInQlik(self,targetValueID,layout,app,true,$element,sfssettings);

							  var selectedCount = 0;
							  $element.find( 'input:checked' ).each(function(){
								  selectedCount += 1;
							  });
							  //default selection if needed
							  checkDefaultValueSelection($element,selectedCount,layout,self,app,sfssettings);
						  }
					  }
				  } );
				} else
				//Button action
				if (visType=='btn'){
					$element.find( 'button' ).on( 'click', function () {
						if (debug) console.log('Button clicked action');
						var clicktarget = $(this);
						if ( $(this).attr( "dval" ) ) {
							var targetValueID = parseInt(clicktarget.attr( "dval" ),10);
							var value = parseInt( clicktarget.attr( "dval" ), 10 );
							clicktarget.addClass('selected'); //to var contorl
							selectValueInQlik(self,value,layout,app,true,$element,sfssettings);
						}
					} );
				//radio action
				} else if (visType=='radio' || visType=='luiradio'){
					$element.find( 'input' ).on('click',function(){
						if (debug) console.log('radio change action');
						var clicktarget = $(this);
						var targetValueID = parseInt(clicktarget.attr( "dval" ),10);
						$element.find( '.selected' ).each(function(){
								var value = parseInt( $(this).attr( "dval" ), 10 );
								if (value != targetValueID){
								  $(this).removeClass('selected');
								  selectValueInQlik(self,value,layout,app,true,$element,sfssettings);
								}
						});
						clicktarget.addClass('selected').prop('selected',true);
						selectValueInQlik(self,targetValueID,layout,app,true,$element,sfssettings);
					});

				} //if
				//sea
				//as default:
				checkDefaultValueSelection($element,countselected,layout,self,app,sfssettings);
			}
			//select2 init
			if (visType=='select2'){
				if(debug) console.log('init select2')
				if (!$("#sfsselect2").length>0){
					$( "<style id=sfsselect2>" ).html( select2css ).appendTo( "head" ); //add css.
				}
				var dropdownparent = "sfssel2c"+layout.qInfo.qId;
				if (!$("#"+dropdownparent).length>0){
					$( '<div id="'+dropdownparent+'" class="qv-object-SimpleFieldSelect sfssel2c">' ).html( "" ).appendTo( "body" );
				}
				var minimumSearchResults = Infinity;
				if (layout.props.select2enableSerach){
					minimumSearchResults = 0;
				}
				$("#"+dropdownparent).html(""); //clear area, select2 may not
				var selectElement = $element.find( '.dropdownsel' );
				selectElement.select2({
					'dropdownParent': $("#"+dropdownparent),
					'allowClear': layout.props.select2allowClear,
					'placeholder': layout.props.visInputPlaceholdertxt,
					'minimumResultsForSearch': minimumSearchResults,
					'templateResult': function (data, container) {
					    if (data.element) {
					      //$(container).addClass($(data.element).attr("class"));
					      $(container).attr('style',$(data.element).attr("style"));
					    }
					    return data.text;
					},
					'templateSelection': function (data, container) {
					    if (data.element) {
					      //$(container).addClass($(data.element).attr("class"));
					      $(container).attr('style',$(data.element).attr("style"));
					      if($(data.element).hasClass("disableBGimage")){
					      	$(container).addClass('disableBGimage'); //for def bgcolor change
					      }
					    }
					    return data.text;
					}
				});
				var select2container = $element.find( '.select2-container' );
				select2container.attr('style', select2container.attr('style') +' '+ selectElement.attr('style')); //copy style
			}
			//search action:
			if(layout.props.enablesearch){
				var searchField = $element.find('#'+searchId);
				var searchIcon = $element.find('.sfssearchIcon');
				var searchSelectionMethod = 1;
				if (visType=='checkbox' || visType=='radio' || visType=='luicheckbox' || visType=='luiradio'){
					searchSelectionMethod = 2;
				} else if(visType=='luiswitch'){
					searchSelectionMethod = 3;
				}
				searchField.on('keyup',function(){
					var filter = $(this).val().toLowerCase();
					if (filter == ''){
						$element.find(".searchSel").removeClass('searchSel').removeClass('searchHide');
					}
					var targets = $element.find(".data");
					if (searchSelectionMethod==2){
						targets.each(function(){
							var parent = $(this).parent();
							//console.log(parent.text());
							if (parent.text().toLowerCase().indexOf(filter) > -1){
								parent.removeClass('searchHide').addClass('searchSel');
							} else {
								parent.addClass('searchHide').removeClass('searchSel');
							}
						});
					} else if (searchSelectionMethod==3){
						targets.each(function(){
							var parent = $(this).parent().parent();
							//console.log(parent.text());
							if (parent.text().toLowerCase().indexOf(filter) > -1){
								parent.removeClass('searchHide').addClass('searchSel');
							} else {
								parent.addClass('searchHide').removeClass('searchSel');
							}
						});
					} else {
						targets.each(function(){
							
							if ($(this).html().toLowerCase().indexOf(filter) > -1){
								$(this).removeClass('searchHide').addClass('searchSel');
							} else {
								$(this).addClass('searchHide').removeClass('searchSel');
							}
						});
					}
				});
				//for enter press
				searchField.keypress(function(e){
					if(e.which == 13){ //enter key pressed
						var valuesToSelect = [];
						if (searchSelectionMethod==2 || searchSelectionMethod==3){
							var targets = $element.find(".searchSel input");
						} else {
							var targets = $element.find(".searchSel");
						}
						targets.each(function(){
							var val = parseInt($(this).attr( "dval" ),10);
							if (!isNaN(val)){
								valuesToSelect.push( val );
							}
						});
						selectValuesInQlik(self, valuesToSelect ,layout,app,false,$element,sfssettings);
					}
				});
				//clear search
				$element.find('#cl'+searchId).click(function(){
					if(searchField.val()==''){ //on second press
						searchField.parent().parent().hide('slow');
						searchIcon.show();
					} else {
						searchField.val('');
						searchField.trigger('keyup');
					}
				});
				searchIcon.click(function(){
					$(this).hide();
					searchField.parent().parent().show('fast');
					searchField.focus();
				});
				if (pr.showXscroll){ //if x scroll, move search icon
					articleInnerElement.find('.qv-object-content-container').scroll(function(){
						var scrollleft = $(this).scrollLeft();
						searchIcon.css('right',-scrollleft);
					});
				}
			}
			//resize
			if((pr.mouseenterWidthMult || pr.mouseenterHeightMult) && (pr.mouseenterWidthMult > 1 || pr.mouseenterHeightMult > 1) && $(".qv-mode-edit").length==0){
				if (debug) console.log('resize');
				var layoutcontainerdiv = articleElement.closest('.qv-gridcell');
				layoutcontainerdiv.mouseenter(function(){
					var origW = layoutcontainerdiv.attr('origW');
					if (!origW){
						layoutcontainerdiv.attr('origW', layoutcontainerdiv.width());
						origW = layoutcontainerdiv.attr('origW');
						layoutcontainerdiv.attr('origH', layoutcontainerdiv.height());
						//layoutcontainerdiv.attr('origZ', layoutcontainerdiv.css('z-index'));
						layoutcontainerdiv.attr('origstyle', layoutcontainerdiv.attr('style'));
					}
					var origH = layoutcontainerdiv.attr('origH');
					pr.mouseenterWidthMult = pr.mouseenterWidthMult < 1 ? 1 : pr.mouseenterWidthMult;
					pr.mouseenterHeightMult = pr.mouseenterHeightMult < 1 ? 1 : pr.mouseenterHeightMult;
					layoutcontainerdiv.css('width', origW*pr.mouseenterWidthMult).css('height', origH*pr.mouseenterHeightMult).css('z-index',101);
				});
				layoutcontainerdiv.mouseleave(function(){
					/*var origH = layoutcontainerdiv.attr('origH');
					var origW = layoutcontainerdiv.attr('origW');
					var origZ = layoutcontainerdiv.attr('origZ');
					layoutcontainerdiv.css('width', origW).css('height', origH).css('z-index',origZ);*/
					var origstyle = layoutcontainerdiv.attr('origstyle');
					layoutcontainerdiv.attr('style',origstyle);
					if (debug) console.log('return');
				});
				
			}

			//curent selections to url
			function getSelectedUrl(dialogOrClipboard){
				
			}

			function hideGetSelUrlFromESC(e){
				if (e.keyCode == 27) {
					$("#sfsgetselurl").hide();
					$(document).off("keydown",hideGetSelUrlFromESC);
				}
			}
			function copyselectedtoclip(){
				
			}
			
			function createhelptextdiv(pr){
				var a = '<div class="sfs_helptxt"';
				if (pr.helptextcss) a += ' style="'+checkUserCSSstyle2(pr.helptextcss,1)+'"';
				a += '>'+ pr.helptext + '</div>';
				return a;
			}
			
			function setKeepaliver(self,delay){
				if (keepaliverTimer){
					clearInterval(keepaliverTimer);
				}
				keepaliverTimer = setInterval(function(){
					if (debug) console.log('Keepalive');
					var app = qlik.currApp();
					app.addAlternateState("sfskeepalive");
					app.removeAlternateState("sfskeepalive");
				},delay*1000*60);
			}
			return qlik.Promise.resolve();
		}
	};
} );

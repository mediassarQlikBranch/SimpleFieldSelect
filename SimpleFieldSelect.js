define( ["qlik", "jquery", "text!./SimpleFieldStyle.css","text!./datepicker.css","./properties.def","./jquery-ui.min"], 
	function ( qlik, $, cssContent, cssDatepick, propertiesdef) {
	'use strict';
	$( "<style>" ).html( cssContent ).appendTo( "head" );
	$( "<style>" ).html( cssDatepick ).appendTo( "head" );
	var debug = false;
	
	
	//If nothing selected but should be
	function checkDefaultValueSelection($element,countselected,layout,self,app){
	  if(debug) console.log('checkin default selection, selected: '+countselected);
	  var forcedelements = $element.find('.forcedelem');
	  //if forced, no need to check defaults
	  /*if (forcedelements.length>0){
	  	checkForcedSelection(layout,self,app,forcedelements);
	  	return false;
	  }*/
	  if (countselected==0 && (layout.props.allwaysOneSelectedDefault != '' || layout.props.selectAlsoThese != '')){
		var defaulttoselect = $element.find( '.defaultelement' );
		var otherdefaultelememnts = $element.find('.otherdefelem');

		//check if element is found
		if (defaulttoselect.length<1 && otherdefaultelememnts.length<1) {
			if(debug) console.log('Default value was not found' +layout.qInfo.qId);
			return;
		}
		var otherDefaultElementsSelectionStyle = true; //depends on if the main default value is selected
		var valuesToSelect = [];
		if (defaulttoselect.length>0){
			if(debug) console.log('selecting default value');
			if (layout.props.visualizationType=='dropdown'){
			  selectValueInQlik(self, parseInt(defaulttoselect.val(),10) ,layout,app,true); //select here, no other defaults
			  return false; //no need to continue
			} else {
			  //selectValueInQlik(self, parseInt(defaulttoselect.attr( "dval" ),10) ,layout,app,false);
			  valuesToSelect.push( parseInt(defaulttoselect.attr( "dval" ),10) );
			  otherDefaultElementsSelectionStyle = false;
			}
		}
		if (otherdefaultelememnts.length>0){
			if(debug) console.log('selecting other defaults, method: '+otherDefaultElementsSelectionStyle);
			otherdefaultelememnts.each(function(elem){
				//selectValueInQlik(self, parseInt($(this).attr( "dval" ),10) ,layout,app,otherDefaultElementsSelectionStyle);
				valuesToSelect.push( parseInt($(this).attr( "dval" ),10) );
			});
		}
		if (valuesToSelect.length>0){
			selectValuesInQlik(self, valuesToSelect ,layout,app,false);
		}
	  }
	}
	function checkForcedSelection(layout,self,app,forcedelements){
		var valuesToSelect = [];
		forcedelements.each(function(elem){
			valuesToSelect.push( parseInt($(this).attr( "dval" ),10) );
		});
		if (valuesToSelect.length>0){
			selectValuesInQlik(self, valuesToSelect ,layout,app,false);
		}
	}
	function selectValueInQlik(self,value,layout,app,selectvalueMethod){ //selectvalueMethod true or false
		if(debug) console.log('set value to index '+value);
		//Variable
		if (layout.props.dimensionIsVariable){
			var valueTxt = layout.props.variableOptionsForValuesArray[ value ];
			//if value is not defined, forexample nothing is selected for variable.
			if (typeof valueTxt == 'undefined' ){
				valueTxt = '';
			}
			if(debug) console.log(' means '+valueTxt+' to variable ' +layout.props.variableName);
			//set variable
			app.variable.setContent(layout.props.variableName, valueTxt);
			//set key value too if defined
			if (layout.props.variableOptionsForKeysArray != [] && layout.props.variableNameForKey && layout.props.variableOptionsForKeysArray[ value ]){
				var keyTxt = layout.props.variableOptionsForKeysArray[ value ];
				if(debug) console.log(' key value '+keyTxt+' to variable ' +layout.props.variableNameForKey);
				app.variable.setContent(layout.props.variableNameForKey, keyTxt);
			}
		//set field
		} else {
			self.backendApi.selectValues( 0, [value], selectvalueMethod );
		}
	}
	function selectValuesInQlik(self,values,layout,app,selectvalueMethod){ //select manyvalues at the same time
		if(debug) console.log('set values to indexes ');
		if(debug) console.log(values);
		self.backendApi.selectValues( 0, values, selectvalueMethod );
	}
	
	return {
		initialProperties: {
			qListObjectDef: {
				qShowAlternatives: true,
				//qFrequencyMode: "V",
				qInitialDataFetch: [{
					qWidth: 2,
					qHeight: 1000
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
			export: false,
			exportData : false
		},
		paint: function ( $element,layout ) {
			if (debug){ console.log('start painting');	console.log(layout); }
			//copy old parameters to support newer structure
			
			var self = this, html = "";
			var app = qlik.currApp();
			//change header size
			var headerelement = $element.parent().parent().prev();
			if (layout.props && layout.props.showHeader){
				headerelement.show();
				if (layout.props.headerSize && layout.props.headerSize != '-'){
					headerelement.css('height',layout.props.headerSize+'px');
				}
				if (layout.props.headerBpadding && layout.props.headerBpadding != '-'){
					headerelement.css('padding-bottom',layout.props.headerBpadding+'px');
				}
			} else {
				headerelement.hide();
			}
			//borders and bg
			var articleInnerElement = headerelement.parent();
			var articleElement = articleInnerElement.parent();
			if (layout.props.transparentBackground){
				articleElement.css('background-color','transparent');
				articleInnerElement.css('background-color','transparent');
			} else if (layout.props.specialBackgroundColor){
				articleElement.css('background-color',layout.props.specialBackgroundColor);
				articleInnerElement.css('background-color',layout.props.specialBackgroundColor);
			} else {
				articleElement.css('background-color','');
				articleInnerElement.css('background-color','');
			}
			if (layout.props.noBorders){
				articleElement.css('border-width','0');
			}
			/*if (layout.props.specialFontcolor){
				articleElement.css('color',layout.props.specialFontcolor);
			} else {
				articleElement.css('color','');
			}*/
			//left padding in one qlik theme
			if(layout.props.leftpadding && layout.props.leftpadding != '-'){
				articleInnerElement.css('padding-left',layout.props.leftpadding+'px');
			}
			//padding
			var paddingDivAdded = 0;
			if(layout.props.contentpadding && layout.props.contentpadding != '-'){
				html += '<div style="padding:'+layout.props.contentpadding +'px">';
				paddingDivAdded = 1;
			}
			//extra label
			var labelAdded = 0;
			if(layout.props.inlinelabeltext){
				html += '<label class=inlinelabel><div class="inlinelabeldiv';
				if (layout.props.inlinelabelSetinline){
					html += ' inlinelabeldivInline';
				}
				html += '">'+layout.props.inlinelabeltext+'</div> ';
				labelAdded = 1;
			}
			//change for mobile
			if ($('.smallDevice').length >0){ //$(window).width()<600
				var parent = $element.closest('.qv-gridcell');
				//console.log(parent.html());
				if(layout.props.mobileRemoveZoom){
					parent.find('.transparent-overlay').remove(); //remove mobile zoom haveto
				}
				//set height, default is too high
				if(layout.props.mobileCustomHeightCSS && layout.props.mobileCustomHeightCSS != ''){
					parent.css('height',layout.props.mobileCustomHeightCSS);
				} else {
					parent.css('height','65px');
				}
			}
			//hiding
			if (layout.props.hideFieldsFromSelectionBar || layout.props.hideFromSelectionsBar){
				//add hide area if needed
				if ($(".hideselstyles").length>0){
					
				} else {
					$('.qv-selections-pager').append('<div style="display:none;" class=hideselstyles></div>');
				}
				//hide global
				if (layout.props.hideFieldsFromSelectionBar && layout.props.hideFieldsFromSelectionBar != ''){
					var splittedfields = layout.props.hideFieldsFromSelectionBar.split(";");
					if (debug){ console.log('hiding fields:'); console.log(splittedfields); }
					splittedfields.forEach(function(fieldToHide,i){
						if ($('#hid'+fieldToHide).length>0){
						//already hidden
						} else {
							$('.hideselstyles').append('<style id="hid'+fieldToHide+'">.qv-selections-pager li[data-csid="'+ fieldToHide +'"] {display:none;}</style>');
						}
					});
				}
				//hide current
				if (layout.props.hideFromSelectionsBar){
					var fieldToHide = layout.props.hideFromSelectionRealField;
					if (fieldToHide == '' || !fieldToHide){
						fieldToHide = layout.qListObject.qDimensionInfo.qGroupFieldDefs[0]; //try this one if not defined.
						if (fieldToHide.slice(0,1)==='='){ //if first letter =
							fieldToHide = fieldToHide.slice(1);
						}
						fieldToHide = fieldToHide.replace(/[\[\]']+/g,''); //reomve []
					}
					if ($('#hid'+fieldToHide).length>0){
						//already hidden
					} else {
						$('.hideselstyles').append('<style id="hid'+fieldToHide+'">.qv-selections-pager li[data-csid="'+ fieldToHide +'"] {display:none;}</style>');
					}
				}
			}
			//Globals CSS mod
			if (layout.props.enableGlobals){
				if ($(".SFSglobalCSS").length>0){
				
				} else {
					articleInnerElement.append('<div style="display:none;" class=SFSglobalCSS></div>');
				}
				var csstxt = '';
				if (layout.props.global_bgcolor){
					csstxt += ' .qv-client.qv-card #qv-stage-container .qvt-sheet { background-color:'+layout.props.global_bgcolor+';}';
				}
				if (layout.props.global_borderwidth && layout.props.global_borderwidth != '-'){
					csstxt += ' .sheet-grid .qv-gridcell:not(.qv-gridcell-empty),.qv-mode-edit .qv-gridcell:not(.qv-gridcell-empty), .sheet-grid :not(.library-dragging)#grid .qv-gridcell.active { border-width:'+layout.props.global_borderwidth+'px;}';
				}
				if (layout.props.global_bordercolor){
					csstxt += ' .sheet-grid .qv-gridcell:not(.qv-gridcell-empty) { border-color:'+layout.props.global_bordercolor+';}';
				}
				
				$(".SFSglobalCSS").html('<style id="">' + csstxt + '</style>');
				if (layout.props.hideSheetTitle){
					$(".sheet-title-container").hide();
				} else {
					if(layout.props.removeSheetTitlePadding){
						$(".sheet-title-container").css('padding','0');
					}
					if(layout.props.sheetTitleheight && layout.props.sheetTitleheight != -1){
						$(".sheet-title-container").css('height',layout.props.sheetTitleheight +'px');
						$("#sheet-title").css('height',layout.props.sheetTitleheight +'px');
					}
					if(layout.props.sheetTitleFontSize && layout.props.sheetTitleFontSize != -1){
						$("#sheet-title").css('font-size',layout.props.sheetTitleFontSize +'px');
					}
				}
				if (layout.props.hideSelectionBar){
					$(".qvt-selections").hide();
				}
				if(layout.props.toolbarheight && layout.props.toolbarheight != -1){
					$(".qui-toolbar").css('height',layout.props.toolbarheight +'px');
				}
				if(layout.props.hideGuiToolbar && $(".qv-mode-edit").length == 0){
					$(".qui-toolbar").hide();
				}
				
				if(layout.props.removeHeaderFromTextImageObjects){
					$(".qv-object-text-image header").hide();
				}
				//$( "<style>" ).html( cssContent ).appendTo( "head" );
			}
			//get variable value
			var varvalue = '';
			if (layout.props.dimensionIsVariable){
				varvalue = layout.variableValue;
				if (debug){ console.log('varvalue from '+layout.props.variableName+' is '); console.log(varvalue); }
			}
			var fontStyleTxt = '';
			if (layout.props.customFontCSS && layout.props.customFontCSS != ''){
				fontStyleTxt = ' font:'+layout.props.customFontCSS+';';
			}
			var elementStyleCSS = '';
			if (layout.props.customStyleCSS && layout.props.customStyleCSS != ''){
				elementStyleCSS = ' '+layout.props.customStyleCSS+';';
			}
			var containerStyles = '';
			if (layout.props.useMaxHeight){
				containerStyles += ' height:98%;';
			}
			if (layout.props.textHAlign && layout.props.textHAlign != '-'){
				containerStyles += ' text-align:'+layout.props.textHAlign+';';
			}
			if (layout.props.textVAlign && layout.props.textVAlign != '-'){
				elementStyleCSS += ' vertical-align:'+layout.props.textVAlign+';';
			}
			var elementExtraAttribute = '';
			if (layout.props.customElementAttribute && layout.props.customElementAttribute != ''){
				elementExtraAttribute = ' '+layout.props.customElementAttribute+' ';
			}
			var elementExtraClass = '';
			if (layout.props.customElementClass && layout.props.customElementClass != ''){
				elementExtraClass = ' '+layout.props.customElementClass+' ';
			}
			var fontsizechanges = '';
			if (layout.props.fontsizeChange && layout.props.fontsizeChange != ''){
				fontsizechanges = ' font-size:'+layout.props.fontsizeChange+'%;';
			}
			//border color style
			var bordercolorstyle = '';
			if (layout.props.color_border && layout.props.color_border != ''){
				bordercolorstyle = ' border-color:'+layout.props.color_border+';';
			}
			var elementpadding = '';
			if (layout.props.elementpadding && layout.props.elementpadding != '' && layout.props.elementpadding != '-'){
				elementpadding = ' padding:'+layout.props.elementpadding+'px;';
			}
			//if date select to variable
			if (layout.props.variableIsDate && layout.props.dimensionIsVariable){
				if (layout.props.variableName){
					if (debug){ console.log('alkuarvo ' + layout.props.variableName); console.log(app.variable.getContent(layout.props.variableName)); }
					var inattributes = 'type=text';
					if(layout.props.visInputNumberMin != ''){
						inattributes += ' min="'+layout.props.visInputNumberMin+'"';
					}
					if(layout.props.visInputNumberMax != ''){
						inattributes += ' max="'+layout.props.visInputNumberMax+'"';
					}
					html += '<input '+inattributes+' title="';
					if (layout.props.hovertitletext && layout.props.hovertitletext != ''){
						html += layout.props.hovertitletext.replace(/\"/g,'&quot;'); //escape quotas!!
					} else {
						html += 'Click to select date';
					}
					html += '" class="pickdate'+elementExtraClass+'" ';
					if (layout.props.visInputPlaceholdertxt && layout.props.visInputPlaceholdertxt != ''){
						html += ' placeholder="'+layout.props.visInputPlaceholdertxt.replace(/\"/g,'&quot;')+'"'; //escape quotas!!
					}
					if (layout.props.color_stateO_bg && layout.props.color_stateO_bg != ''){
						elementStyleCSS += 'background-color:'+layout.props.color_stateO_bg+';';
					}
					if (layout.props.color_stateO_fo && layout.props.color_stateO_fo != ''){
						elementStyleCSS += ' color:'+layout.props.color_stateO_fo+';';
					}
					html += 'value="'+varvalue+'" style="width:6em; max-width:80%;'+fontsizechanges+fontStyleTxt+elementStyleCSS+bordercolorstyle+elementpadding+'"' +elementExtraAttribute+ '/>';
					if(labelAdded) html += '</label>';
					if (layout.props.helptext){
						html += '<div class="sfs_helptxt">'+ layout.props.helptext + '</div>';
					}
					if(paddingDivAdded) html += '</div>';
					$element.html( html );
					
					var datepickElement = $element.find( '.pickdate' );
					datepickElement.datepicker({
						dateFormat: layout.props.dateformat,
						changeMonth: true,
						changeYear: true,
						showOn: "both",
						maxDate: layout.props.visInputNumberMax,
						minDate: layout.props.visInputNumberMin,
						firstDay:1,
						constrainInput: true
					});
					 //dates limited? will be depricated
					if (layout.props.maxLimitvariable && layout.props.maxLimitvariable && layout.props.maxLimitvariable != '-'){
						if (debug){ console.log('Limiting days to '); console.log(layout.props.maxLimitvariable); }
						var parsedDate = $.datepicker.parseDate(layout.props.dateformat, layout.props.maxLimitvariable);
						datepickElement.datepicker( "option", "maxDate", parsedDate );
					}
					$element.find( '.pickdate' ).on( 'change', function () {
						var newval = $(this).val();
						if(debug) console.log('NEW '+newval + ' to '+layout.props.variableName);
						app.variable.setContent(layout.props.variableName, newval);
					});
				}
			//html input for variable
			} else if (layout.props.visualizationType=='input' && !layout.props.variableIsDate) {
				var datalist = '', datalistID='';
				if (layout.props.color_stateO_bg && layout.props.color_stateO_bg != ''){
					elementStyleCSS += 'background-color:'+layout.props.color_stateO_bg+';';
				}
				if (layout.props.color_stateO_fo && layout.props.color_stateO_fo != ''){
					elementStyleCSS += ' color:'+layout.props.color_stateO_fo+';';
				}
				if (!layout.props.dimensionIsVariable){
					html += 'HTML input option is available only for variables';
				} else {
					//if stepped, datalist values
					var splitted = layout.props.variableOptionsForValues.split(";");
					var splittedkeys = layout.props.variableOptionsForKeys.split(";");
					if(splitted && layout.props.variableOptionsForValues != ''){
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
					var inattributes = 'type='+layout.props.visInputFieldType;
					if(layout.props.visInputFieldType!='text' && layout.props.visInputFieldType!='password'){
						if(layout.props.visInputNumberMin != ''){
							inattributes += ' min="'+layout.props.visInputNumberMin+'"';
						}
						if(layout.props.visInputNumberMax != ''){
							inattributes += ' max="'+layout.props.visInputNumberMax+'"';
						}
						if(layout.props.visInputNumberStep != ''){
							inattributes += ' step="'+layout.props.visInputNumberStep+'"';
						}
					}
					//build html
					html += '<input '+inattributes+' title="';
					if(layout.props.visInputFieldType=='range') html += varvalue+' ';
					if (layout.props.hovertitletext && layout.props.hovertitletext != ''){
						html += layout.props.hovertitletext.replace(/\"/g,'&quot;'); //escape quotas!!
					}
					html += '"';
					if (datalist) html += ' list="'+datalistID+'"';
					if (layout.props.visInputPlaceholdertxt && layout.props.visInputPlaceholdertxt != ''){
						html += ' placeholder="'+layout.props.visInputPlaceholdertxt.replace(/\"/g,'&quot;')+'"'; //escape quotas!!
					}
					html += ' class="htmlin '+elementExtraClass+'" value="'+varvalue+'" style="'+fontsizechanges+fontStyleTxt+elementStyleCSS+bordercolorstyle+elementpadding+containerStyles+'"' +elementExtraAttribute+ '/>';
					if (datalist) html += datalist;
					if(layout.props.visInputRangeSliderValuefield && layout.props.visInputFieldType=='range'){
						html += '<span class="rangval">'+varvalue+'</span>';
					}
					
					if(labelAdded) html += '</label>';
					if (layout.props.helptext){
						html += '<div class="sfs_helptxt">'+ layout.props.helptext + '</div>';
					}
					if(paddingDivAdded) html += '</div>';
				}
				$element.html( html );
				$element.find( '.htmlin' ).on( 'change select', function () { //select for datalist
					var newval = $(this).val();
					if (newval != layout.variableValue){
						if(debug) console.log('NEW '+newval + ' to '+layout.props.variableName);
						app.variable.setContent(layout.props.variableName, newval);
					}
				});
				if(layout.props.visInputFieldType=='range'){
					/* for jquery slider....
					var handle = $( "#custom-handle" );
					$element.find('#slider').slider({
						slide: function( event, ui ) {
        					alert( ui.value );
        					handle.text( ui.value );
      					}
					});*/
				}
			//not date or html input:
			} else {
				
				html += '<div class="checkboxgroup"';
				if (layout.props.hovertitletext && layout.props.hovertitletext != ''){
					html += ' title="'+layout.props.hovertitletext.replace(/\"/g,'&quot;')+'"'; //escape quotas!!
				}
				html += '>';
				var countselected = 0;
				var stylechanges = ' style="'+fontsizechanges+fontStyleTxt+containerStyles;
				stylechanges += '"';
				if (layout.props.visualizationType=='vlist'){
					html += '<ul'+stylechanges+'>';
				}else if (layout.props.visualizationType=='hlist'){
					var roundcornerClass=' rcorners';
					if (layout.props.hlistRoundedcorners===false){
						roundcornerClass='';
					}
					var rmarginclass = ' rmargin1';
					if (layout.props.hlistMarginBetween >= 0){ //its defined
						rmarginclass = ' rmargin'+layout.props.hlistMarginBetween;
					}
					var displayastableClass = '';
					if (layout.props.hlistShowAsTable){
						displayastableClass = ' ulastable'
					}
					html += '<ul class="horizontal'+roundcornerClass+rmarginclass+displayastableClass+'" '+stylechanges+'>';
				} else if (layout.props.visualizationType=='checkbox' || layout.props.visualizationType=='radio'){
					html += '<div '+stylechanges+'>';
				} else if (layout.props.visualizationType=='dropdown'){
					html += '<select class="dropdownsel'+elementExtraClass+'" style="'+fontsizechanges+fontStyleTxt+elementStyleCSS+bordercolorstyle+elementpadding+containerStyles+'"' +elementExtraAttribute+ '>';
				} else if (layout.props.visualizationType=='btn'){
					html += '<div '+stylechanges+'>';
				} else {
					html += 'Select visualization type';
				}
				
				//print elements
				var optionsforselect = [];
				if (layout.props.dimensionIsVariable){
					//generate variable options from field
					if (debug) console.log('variable value '+varvalue);
					if (!layout.props.variableOptionsForValues){
						html += 'Set variable options or enable date selector or switch to HTML standard input visualization';
					}
					var splitted = layout.props.variableOptionsForValues.split(";");
					var varindex = 0; //index is used to access variable
					layout.props.variableOptionsForValuesArray = [];
					layout.props.variableOptionsForKeysArray = [];
					splitted.forEach(function(opt){
						var qState = 'O';
						//if values match with current, mark selected
						if (varvalue == opt) {
							qState = 'S'; 
						} //build qlik style object for printing
						optionsforselect.push( [{qState:qState, qText:opt, qElemNumber:varindex}] );
						layout.props.variableOptionsForValuesArray.push(opt); //when setting variable, take value from here.
						varindex += 1;
					});
					if (debug){ console.log(layout.props.variableOptionsForValues); }
					//if separate Keys variable is defined:
					var varKeyindex = 0;
					if (layout.props.dimensionIsVariable && layout.props.variableOptionsForKeys != ''){
						splitted = layout.props.variableOptionsForKeys.split(";");
						splitted.forEach(function(opt){
							layout.props.variableOptionsForKeysArray.push(opt); //when setting variable, take value from here.
							varKeyindex += 1;
						});
						if (varindex != varKeyindex){
							console.log('variable values and key options do not match. Values: '+varindex + ' vs. keys: '+varKeyindex);
							layout.props.variableOptionsForKeysArray = []; //reset array
						}
					}
					
				//if not variable:
				} else {
					optionsforselect = layout.qListObject.qDataPages[0].qMatrix;
				}
				//dropdown default option
				if (layout.props.visualizationType=='dropdown' && layout.props.dropdownValueForNoSelect && layout.props.dropdownValueForNoSelect != ''){
					html += '<option class="state0" value=""> ' + layout.props.dropdownValueForNoSelect;
					html += '</option>';
				}
				//fetch other default values
				var otherDefaultValues = [];
				if (!layout.props.selectOnlyOne && layout.props.selectAlsoThese && layout.props.selectAlsoThese != '' && !layout.props.dimensionIsVariable &&
						layout.props.visualizationType!='dropdown' && layout.props.visualizationType!='btn' && layout.props.visualizationType!='radio'){
					otherDefaultValues = layout.props.selectAlsoThese.split(";");
					//console.log(otherDefaultValues);
				}
				//forced values
				var forcedValues = [];
				if (layout.props.ForceSelections && layout.props.ForceSelections != ''){
					forcedValues = layout.props.ForceSelections.split(";");
				}
				//paint options
				optionsforselect.forEach( function ( row ) {
					if (layout.props.hidePassiveItems && !layout.props.dimensionIsVariable && row[0].qState === 'X'){ //if passive hiding enabled
						return; //exit current function
					}
					//var elementid = layout.qInfo.qId+''+row[0].qElemNumber;
					var defaultelementclass = '',checkedstatus = '',dis = '', selectedClass = '', dropselection = '', otherdefaultelementclass = '';
					if (row[0].qState === 'S') { 
						checkedstatus = ' checked'; 
						countselected += 1;
						selectedClass = ' selected';
						dropselection = ' selected';
					}
					//if only one, but somewhere already selected... deselect rest. And if not variable
					if (layout.props.selectOnlyOne && !layout.props.dimensionIsVariable && countselected > 1){
						if (debug) console.log('Select only one enabled, reducing selections.');
						checkedstatus = ''; selectedClass = ''; dropselection = '';
						if (layout.props.visualizationType=='dropdown'){
						  //self.backendApi.selectValues( 0, [ row[0].qElemNumber ], false );
						  selectValueInQlik(self,row[0].qElemNumber,layout,app,false);
						} else {
						  //self.backendApi.selectValues( 0, [ row[0].qElemNumber ], false );
						  selectValueInQlik(self,row[0].qElemNumber,layout,app,false);
						}
						countselected -= 1; //reduce one because deselected
					}

					//mark defaultvalue
					if (layout.props.allwaysOneSelectedDefault != '' && row[0].qText == layout.props.allwaysOneSelectedDefault) {
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
					
					//if (layout.props.visualizationType=='hlist' || layout.props.visualizationType=='vlist' || layout.props.visualizationType=='checkbox' || layout.props.visualizationType=='btn' || layout.props.visualizationType=='radio'){
					if (layout.props.visualizationType!='dropdown'){
						var colorclasses = '';
						var elementstyle = ' style="';
						//color selections
						if (row[0].qState === 'S'){
							//set special color if set
							if (layout.props.color_stateS_bg && layout.props.color_stateS_bg != ''){
								colorclasses += ' disableBGimage';
								elementstyle += 'background-color:'+layout.props.color_stateS_bg+';';
							}
							//font color
							if (layout.props.color_stateS_fo && layout.props.color_stateS_fo != ''){
								elementstyle += ' color:'+layout.props.color_stateS_fo+';';
							}
						} else if (row[0].qState === 'O'){
							if (layout.props.color_stateO_bg && layout.props.color_stateO_bg != ''){
								elementstyle += 'background-color:'+layout.props.color_stateO_bg+';';
							}
							if (layout.props.color_stateO_fo && layout.props.color_stateO_fo != ''){
								elementstyle += ' color:'+layout.props.color_stateO_fo+';';
							}
						} else if (row[0].qState === 'X'){
							if (layout.props.color_stateX_bg && layout.props.color_stateX_bg != ''){
								elementstyle += 'background-color:'+layout.props.color_stateX_bg+';';
							}
							if (layout.props.color_stateX_fo && layout.props.color_stateX_fo != ''){
								elementstyle += ' color:'+layout.props.color_stateX_fo+';';
							}
						} else if (row[0].qState === 'A'){
							if (layout.props.color_stateA_bg && layout.props.color_stateA_bg != ''){
								elementstyle += 'background-color:'+layout.props.color_stateA_bg+';';
							}
							if (layout.props.color_stateA_fo && layout.props.color_stateA_fo != ''){
								elementstyle += ' color:'+layout.props.color_stateA_fo+';';
							}
						}
						elementstyle += bordercolorstyle+elementStyleCSS+elementpadding;
						elementstyle += '"';
						//list
						if (layout.props.visualizationType=='hlist' || layout.props.visualizationType=='vlist'){
							html += '<li class="data '+selectedClass+defaultelementclass+otherdefaultelementclass+colorclasses+' state' + row[0].qState + ''+elementExtraClass+'" dval="' + row[0].qElemNumber + '"'+elementstyle+'' +elementExtraAttribute+ '>' + row[0].qText;
							html += '</li>';
						//checkbox
						} else if (layout.props.visualizationType=='checkbox'){
							html += '<label'+elementstyle+''+elementExtraClass+'>'
							html += '<input type="checkbox" class="data state' + row[0].qState +defaultelementclass+otherdefaultelementclass+selectedClass+colorclasses+ '" dval="' + row[0].qElemNumber + '"' + dis + checkedstatus +' ' +elementExtraAttribute+ '/> ' + row[0].qText; //
							html += '</label>';
						//button
						} else if (layout.props.visualizationType=='btn'){
							html += '<button'+elementstyle+''+elementExtraClass+''
							html += ' class="sfsbtn state' + row[0].qState +defaultelementclass+selectedClass+colorclasses+ '" dval="' + row[0].qElemNumber + '"' + dis + ' ' +elementExtraAttribute+ '> ' + row[0].qText; //
							html += '</button> ';
						//radio
						} else if (layout.props.visualizationType=='radio'){
							html += '<label'+elementstyle+''+elementExtraClass+'>'
							html += '<input type="radio" name="sfs'+layout.qInfo.qId+'" class="state' + row[0].qState +defaultelementclass+selectedClass+colorclasses+ '" dval="' + row[0].qElemNumber + '"' + dis + checkedstatus +' ' +elementExtraAttribute+ '/> ' + row[0].qText; //
							html += '</label>';
						}
					} else if (layout.props.visualizationType=='dropdown'){
						html += '<option class="state' + row[0].qState +defaultelementclass+selectedClass+ '" value="' + row[0].qElemNumber + '"' + dis + dropselection + ' > ' + row[0].qText;
						html += '</option>';
					}
				});
				if (layout.props.visualizationType=='hlist' || layout.props.visualizationType=='vlist'){
					html += '</ul>';
				}else if (layout.props.visualizationType=='dropdown'){
					html += '</select>';
				}else if (layout.props.visualizationType=='checkbox' || layout.props.visualizationType=='btn' || layout.props.visualizationType=='radio'){
					html += '</div>';
				}
				html += '</div>';
				if(labelAdded) html += '</label>';
				if (layout.props.helptext){
					html += '<div class="sfs_helptxt">'+ layout.props.helptext + '</div>';
				}
				if(paddingDivAdded) html += '</div>';
				var showContextMenu = 0;
				if (layout.props.rightclikcmenu && !layout.props.dimensionIsVariable && (layout.props.visualizationType=='hlist' || layout.props.visualizationType=='vlist' || layout.props.visualizationType=='checkbox')){
					showContextMenu = 1;
				}

				$element.html( html );
				//context menu actions
				if (showContextMenu){
					var sfsrmenu;
					var contextmenuID = 'sfsrmenu'+layout.qInfo.qId;
					if ($("."+contextmenuID).length>0){
						sfsrmenu = $("body").find('.'+contextmenuID);
					} else {
						/*if ($("#sfscntxmenudiv").length>0){
						
						} else {
							//$('body').append('<div style="display:none;" class="qv-object-SimpleFieldSelect" id=sfscntxmenudiv></div>');
						}*/
						var contextmenuHtml = '<div class="qv-object-SimpleFieldSelect sfsrmenu '+contextmenuID+'"><ul>';
						if(layout.props.rightclikcmenu_selall) contextmenuHtml += '<li act="all">Select all</li>';
						if(layout.props.rightclikcmenu_clear) contextmenuHtml += '<li act="clear">Clear selections</li>';
						if(layout.props.rightclikcmenu_reverse) contextmenuHtml += '<li act="reverse">Reverse selection</li>';
						if(layout.props.rightclikcmenu_possible) contextmenuHtml += '<li act="possible">Select possible</li>';
						if(layout.props.rightclikcmenu_random) contextmenuHtml += '<li act="random">Select randomnly</li>';
						if(layout.props.rightclikcmenu_defaults) contextmenuHtml += '<li act="defaults">Select defaults</li>';
						contextmenuHtml += '</ul></div>';
						$('body').append(contextmenuHtml);
					
						sfsrmenu = $("body").find('.'+contextmenuID);
						$element.on("contextmenu", function (event) {
							event.preventDefault();
							sfsrmenu.finish().toggle(100).
							css({top: event.pageY + "px", left: event.pageX + "px"});
							$(document).on("mousedown", document, hidermenu);
						});
					}
					function hidermenu(e){ //hide menu
						if (!$(e.target).parents("."+contextmenuID).length > 0) {
							//e.preventDefault();
							if (debug) console.log('menuhide '+contextmenuID);
							$(".sfsrmenu").hide(100);
							$(document).unbind('mousedown',hidermenu);
						}
					}
					sfsrmenu.find('li').click(function(){
						var action = $(this).attr('act');
						if (debug) console.log(action);
						sfsrmenu.hide(100);
						var valuesToSelect = [];
						if (action=='all'){
							$element.find('.data').each(function(){
								valuesToSelect.push( parseInt($(this).attr( "dval" ),10) );
							});
							
						} else 
						if (action=='clear'){
							if (debug) console.log('clear selections');
							//selectValuesInQlik(self, [] ,layout,app,false);
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
						}

						selectValuesInQlik(self, valuesToSelect ,layout,app,false);
					});
				}

				
				//list action
				if (layout.props.visualizationType=='hlist' || layout.props.visualizationType=='vlist'){
					/*var isMouseDown = false;
					//for mousedown select track mousedown
					$element.mousedown(function() {
        				isMouseDown = true;
					})
					.mouseup(function() {
						isMouseDown = false;
					});*/
					$element.find( '.checkboxgroup li' ).on( 'qv-activate', function (ev) { //mouseenter
						/*if(isMouseDown == false && ev.type=='mouseenter'){
							return;
						}*/
						var klikkauskohde = $(this);
						var kohteenValueID = parseInt(klikkauskohde.attr( "dval" ),10);
						if (debug) console.log('qv active on list change');
						//var value = parseInt( klikkauskohde.attr( "dval" ), 10 );

						if (!$(this).hasClass('selected')){
							if (debug) console.log('is not selected');
							if (layout.props.selectOnlyOne && !layout.props.dimensionIsVariable){
							  if (debug) console.log('removing selections');
							  $element.find( '.selected' ).each(function(){
								var value = parseInt( $(this).attr( "dval" ), 10 );
								if (value != kohteenValueID){
								  selectValueInQlik(self,value,layout,app,true);
								  $(this).removeClass('selected');
								}
							  });
							}
							selectValueInQlik(self,kohteenValueID,layout,app,true);
							this.classList.toggle("selected");
						//deselect, because selected already
						} else {
							if (layout.props.dimensionIsVariable || layout.props.selectOnlyOne){
								if (debug) console.log('no selection change');
							} else {
								if (debug) console.log('de selecting');
								klikkauskohde.removeClass('selected');
								selectValueInQlik(self,kohteenValueID,layout,app,true);
								var selectedCount = 0;
								$element.find( '.selected' ).each(function(){
								  selectedCount += 1;
								});
								checkDefaultValueSelection($element,selectedCount,layout,self,app);
							}
						}
					} );
					/*$element.find( 'li' ).on( 'mouseenter', function () {
						if(isMouseDown){
							$(this).trigger('qv-activate');
						}
					});*/
					
				} else
				//dropdown change  layout.props.visualizationType=='radio'
				if (layout.props.visualizationType=='dropdown'){
					$element.find( '.dropdownsel' ).on('change',function(){
						if (debug) console.log('select change action');
						var klikkauskohde = $(this).find(":selected");
						var kohteenValueID = parseInt(klikkauskohde.val(),10);
						$element.find( '.selected' ).each(function(){
								var value = parseInt( $(this).val(), 10 );
								if (value != kohteenValueID){
								  selectValueInQlik(self,value,layout,app,true);
								  $(this).removeClass('selected');
								}
						});
						klikkauskohde.addClass('selected').prop('selected',true);
						selectValueInQlik(self,kohteenValueID,layout,app,true);
					});
				} else
				//attach click event to checkbox
				if (layout.props.visualizationType=='checkbox'){
				  $element.find( 'input' ).on( 'click', function () {
				  //self.backendApi.clearSelections();
					  if (debug) console.log('checkbox clicked action');
					  var klikkauskohde = $(this);
					  if ( $(this).attr( "dval" ) ) {
						  var kohteenValueID = parseInt(klikkauskohde.attr( "dval" ),10);
						  //when checking
						  if ($(this).is(':checked')){
							//if only one, clear others.
							if (layout.props.selectOnlyOne){
								$element.find( 'input:checked' ).each(function(){
									var value = parseInt( $(this).attr( "dval" ), 10 );
									if (value != kohteenValueID){
									  selectValueInQlik(self,value,layout,app,true);
									  $(this).prop('checked',false).removeClass('selected');
									}
								});
								//or is needed?
								klikkauskohde.prop('checked',true).addClass('selected');
							}
							selectValueInQlik(self,kohteenValueID,layout,app,true);
						  //remove check from box
						  } else {
							  //deselect
							  if (debug) console.log('deseelct');
							  //var value = parseInt( $(this).attr( "dval" ), 10 );
							  klikkauskohde.prop('checked',false).removeClass('selected');
							  if (debug) console.log(klikkauskohde.attr("dval"));
							  selectValueInQlik(self,kohteenValueID,layout,app,true);

							  var selectedCount = 0;
							  $element.find( 'input:checked' ).each(function(){
								  selectedCount += 1;
							  });
							  //default selection if needed
							  checkDefaultValueSelection($element,selectedCount,layout,self,app);
						  }
					  }
				  } );
				} else
				//Button action
				if (layout.props.visualizationType=='btn'){
					$element.find( 'button' ).on( 'click', function () {
						if (debug) console.log('Button clicked action');
						var klikkauskohde = $(this);
						if ( $(this).attr( "dval" ) ) {
							var kohteenValueID = parseInt(klikkauskohde.attr( "dval" ),10);
							var value = parseInt( klikkauskohde.attr( "dval" ), 10 );
							selectValueInQlik(self,value,layout,app,true);
						}
					} );
				//radio action
				} else if (layout.props.visualizationType=='radio'){
					$element.find( 'input' ).on('click',function(){
						if (debug) console.log('radio change action');
						var klikkauskohde = $(this);
						var kohteenValueID = parseInt(klikkauskohde.attr( "dval" ),10);
						$element.find( '.selected' ).each(function(){
								var value = parseInt( $(this).attr( "dval" ), 10 );
								if (value != kohteenValueID){
								  selectValueInQlik(self,value,layout,app,true);
								  $(this).removeClass('selected');
								}
						});
						klikkauskohde.addClass('selected').prop('selected',true);
						selectValueInQlik(self,kohteenValueID,layout,app,true);
					});

				} //if
				//as default:
				checkDefaultValueSelection($element,countselected,layout,self,app);
			}
			
			return qlik.Promise.resolve();
		}
	};
} );

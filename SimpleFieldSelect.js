define( ["qlik", "jquery", "text!./SimpleFieldStyle.css","text!./datepicker.css","./properties.def","text!./select2/select2.css","./jquery-ui.min","./select2/select2.min"], 
	function ( qlik, $, cssContent, cssDatepick, propertiesdef,select2css) {
	'use strict';
	if (!$("#sfscss").length>0){
		$( '<style id="sfscss">' ).html( cssContent ).appendTo( "head" );
	}
	var debug = false;
	var initialParameters = {'qWidth':1, 'qHeight':10000};
	
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
			if(debug){ console.log('select many'); console.log(valuesToSelect);}
			selectValuesInQlik(self, valuesToSelect ,layout,app,false);
		}
	  }
	}
	//not in use yet
	function checkForcedSelection(layout,self,app,forcedelements){
		var valuesToSelect = [];
		forcedelements.each(function(elem){
			valuesToSelect.push( parseInt($(this).attr( "dval" ),10) );
		});
		if (valuesToSelect.length>0){
			selectValuesInQlik(self, valuesToSelect ,layout,app,false);
		}
	}
	function selectValueInQlik(self,value,layout,app,selectvalueMethod){ //selectvalueMethod true or false. This is not used for datepicker
		//Variable
		if (layout.props.dimensionIsVariable){
			if(debug) console.log('set variable value to '+value);
			if (! (layout.props.variableOptionsForValuesArray && layout.props.variableOptionsForValuesArray.length>0)){
				if(debug) console.log('No values in variableOptionsForValuesArray');
				return;
			}
			if(layout.props.variableName=='' || !layout.props.variableName || typeof layout.props.variableName =='object'){
				if(debug) console.log('Variable name is empty');
				return;	
			}
			var valueTxt = layout.props.variableOptionsForValuesArray[ value ];
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
			if(debug) console.log(' means '+valueTxt+' to variable ' +layout.props.variableName);
			//set variable
			app.variable.setStringValue(layout.props.variableName, valueTxt);
			//set key value too if defined
			if (layout.props.variableOptionsForKeysArray != [] && layout.props.variableNameForKey && layout.props.variableOptionsForKeysArray[ value ]){
				var keyTxt = layout.props.variableOptionsForKeysArray[ value ];
				if(debug) console.log(' key value '+keyTxt+' to variable ' +layout.props.variableNameForKey);
				if (clearingSelection){ //if main value is being set to empty, set key also.
					keyTxt = '';
				}
				app.variable.setStringValue(layout.props.variableNameForKey, keyTxt);
			}
		//set field
		} else {
			if(debug) console.log('set value to index '+value);
			self.backendApi.selectValues( 0, [value], selectvalueMethod );
		}
	}
	//select manyvalues at the same time
	function selectValuesInQlik(self,values,layout,app,selectvalueMethod){
		if(debug) { console.log('set values to indexes '); console.log(values); }
		if (layout.props.dimensionIsVariable){
			selectValueInQlik(self,values[0],layout,app,selectvalueMethod);
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
			export: true,
			exportData : false
		},
		resize: function($element,layout){
			if (debug) console.log('resize method');
			var pr = layout.props;
			//when exiting edit mode.
			if(pr.enableGlobals && pr.hideGuiToolbar && $(".qv-mode-edit").length == 0){
				$("#qv-toolbar-container").hide();
			}
			return false;
		},
		paint: function ( $element,layout ) {
			if (debug){ console.log('start painting '+layout.qInfo.qId);  console.log(layout.qListObject.qDataPages.length);}

			var self = this, html = "";
			var app = qlik.currApp();
			
			var pr = layout.props;
			var visType = pr.visualizationType;

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
			} else {
				if (layout.qListObject.qDataPages.length==0 && visType !='txtonly' ) {
					$element.html('<h3>Select one dimension first!</h3> Or use textarea only - visualization option<br /> Datepicker can only control a variable. To use datepicker, select a varibale and enable "Variable is a date selector"-option.');
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
				articleElement.parent().parent().css('border-width','0');
			} else {
				if (pr.ownBordercolor2 != ''){
					articleElement.css('border-color',pr.ownBordercolor2);
				}
				if (pr.ownBordercolor != ''){
					articleElement.parent().parent().css('border-color',pr.ownBordercolor);
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
				html += '">'+pr.inlinelabeltext+'</div> ';
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
				html += '<div class="sfssearchIcon"><span class="lui-icon  lui-icon--search"></span></div>';
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
			//hiding, global or local..
			if (pr.hideFieldsFromSelectionBar || pr.hideFromSelectionsBar){
				//add hide area if needed
				if ($(".hideselstyles").length>0){
					
				} else {
					$('.qv-selections-pager').append('<div style="display:none;" class=hideselstyles></div>');
				}
				//hide global
				if (pr.hideFieldsFromSelectionBar && pr.hideFieldsFromSelectionBar != ''){
					var splittedfields = pr.hideFieldsFromSelectionBar.split(";");
					if (debug){ console.log('hiding fields:'); console.log(splittedfields); }
					splittedfields.forEach(function(fieldToHide,i){
						var fieldToHideSelector = fieldToHide.replace(/ /g,'_').replace(/=/g,'');
						if ($('#hid'+fieldToHideSelector).length>0){
						//already hidden
						} else {
							$('.hideselstyles').append('<style id="hid'+fieldToHideSelector+'">.qv-selections-pager li[data-csid="'+ fieldToHide +'"] {display:none;}</style>');
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
					if ($('#hid'+fieldToHideSelector).length>0){
						//already hidden
					} else {
						$('.hideselstyles').append('<style id="hid'+fieldToHideSelector+'">.qv-selections-pager li[data-csid="'+ fieldToHide +'"] {display:none;}</style>');
					}
				}
			}
			//Globals CSS mod
			if (pr.enableGlobals){
				if(debug) console.log('enabled globals ' + layout.qInfo.qId);
				var sfsglobalCSSid = "SFSglobalCSS"+layout.qInfo.qId
				if ($("#"+sfsglobalCSSid).length>0){
				
				} else {
					articleElement.append($( '<div id="'+sfsglobalCSSid+'" style="display:none;"></div>' ));
				}
				var csstxt = '';
				if (pr.global_bgcolor){
					csstxt += ' .qv-client #qv-stage-container .qvt-sheet, .qv-client.qv-card #qv-stage-container .qvt-sheet { background-color:'+pr.global_bgcolor+';}';
				}
				if (pr.global_bgcss){
					csstxt += ' .qv-client #qv-stage-container .qvt-sheet, .qv-client.qv-card #qv-stage-container .qvt-sheet {'+pr.global_bgcss+'}';
				}
				if (pr.global_borderwidth && pr.global_borderwidth != '-'){
					csstxt += ' .sheet-grid .qv-gridcell:not(.qv-gridcell-empty),.qv-mode-edit .qv-gridcell:not(.qv-gridcell-empty), .sheet-grid :not(.library-dragging)#grid .qv-gridcell.active { border-width:'+pr.global_borderwidth+'px;}';
				}
				if (pr.global_bordercolor){ //tbfixed, border on more than one level
					csstxt += ' .sheet-grid .qv-gridcell:not(.qv-gridcell-empty) { border-color:'+pr.global_bordercolor+';}';
				}
				if (typeof pr.global_bordercolor2 === 'undefined'){ //use nro 1
					csstxt += ' .sheet-grid .qv-gridcell:not(.qv-gridcell-empty) { border-color:'+pr.global_bordercolor+';}';
				} else if (pr.global_bordercolor2){ //tbfixed, border on more than one level
					csstxt += ' .sheet-grid .qv-gridcell:not(.qv-gridcell-empty) .qv-object { border-color:'+pr.global_bordercolor2+'!important;}';
				}
				if(pr.removeHeaderFromTextImageObjects){
					csstxt += " .qv-object-text-image header {display:none!important;}";
				}
				if(pr.removeHeaderFromAllObjects){
					csstxt += " .qv-object header {display:none!important;}";
				}
				if(pr.headerTpadding_global && pr.headerTpadding_global != '-'){
					csstxt += " .qv-object header h1 {padding-top:"+pr.headerTpadding_global+"px!important;}";
				}
				if(pr.headerBpadding_global && pr.headerBpadding_global != '-'){
					csstxt += " .qv-object header  {padding-bottom:"+pr.headerBpadding_global+"px!important;}";
				}
				if(pr.headerfontcolor_global && pr.headerfontcolor_global != ''){
					csstxt += " .qv-object header h1 {color:"+pr.headerfontcolor_global+"!important;}";
				}
				if(pr.headerbgcolor_global && pr.headerbgcolor_global != ''){
					csstxt += " .qv-object header {background-color:"+pr.headerbgcolor_global+"!important;}";
				}
				if(pr.leftpadding_global && pr.leftpadding_global != '-'){
					csstxt += ' .qv-object .qv-inner-object {padding-left:'+pr.leftpadding_global+'px!important;}';
				}
				if(pr.rightpadding_global && pr.rightpadding_global != '-'){
					csstxt += ' .qv-object .qv-inner-object {padding-right:'+pr.rightpadding_global+'px!important;}';
				}
				if(pr.removeHeaderIfNoText){
					csstxt += ' .qv-object header.thin {display:none!important;}';
				}
				if(pr.fontfamily_global && pr.fontfamily_global != ''){
					csstxt += ' .qv-object * {font-family:"'+pr.fontfamily_global+'";}';
				}
				if(pr.global_elementbgcolor && pr.global_elementbgcolor != ''){
					csstxt += ' .qv-client #qv-stage-container #grid .qv-object-wrapper .qv-inner-object, .qv-client.qv-card #qv-stage-container #grid .qv-object-wrapper .qv-inner-object {background-color:'+pr.global_elementbgcolor+'!important;}'; //ow element style
				}
				if(pr.global_fontcolor && pr.global_fontcolor != ''){
					csstxt += ' .qv-client #qv-stage-container .qvt-sheet {color:'+pr.global_fontcolor+';}';
					csstxt += ' .qvt-visualization-title, .qv-object-SimpleFieldSelect .inlinelabeldiv, .qv-object .qv-media-tool-html {color:'+pr.global_fontcolor+';}';
				}
				if(pr.hidepivotTableSelectors){
					csstxt += " .qv-object .left-meta-headers,.qv-object .top-meta {display:none!important;}";
				}
				if(pr.hideInsightsButton){
					csstxt += " .qv-insight-toggle-button {display:none!important;}";
				}
				if(pr.hideSelectionsTool){
					csstxt += ' .qv-subtoolbar-button[tid="currentSelections.toggleGlobalSelections"] {display:none!important;}';
				}
				if(pr.hideSmartSearchButton){
					csstxt += ' .qv-subtoolbar-button[tid="toggleGlobalSearchButton"] {display:none!important;}';
				}
				if(pr.hideGuiToolbar && $(".qv-mode-edit").length == 0){
					//$(".qv-toolbar-container").css('display','none');
					csstxt += ' #qv-toolbar-container {display:none!important;}';
					csstxt += '.qv-panel {height:100%;}';
				}
				$("#"+sfsglobalCSSid).html('<style>' + csstxt + '</style>');
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
							$(".qv-selections-pager").append('<div id="sfsSelBartxt" class="item" style="width:unset; max-width:220px; cursor:default;padding-left:5px;padding-right:15px;"></div>');
						}
						$("#sfsSelBartxt").html(pr.selBarExtraText).prop('title',pr.selBarExtraText);
					}
				}
				if(pr.toolbarheight && pr.toolbarheight != -1){
					$(".qui-toolbar").css('height',pr.toolbarheight +'px');
				}
			}
			//get variable value
			var varvalue = '';
			if (pr.dimensionIsVariable){
				varvalue = layout.variableValue;
				if (debug){ console.log('varvalue from '+pr.variableName+' is '); console.log(varvalue); }
			}
			var fontStyleTxt = '';
			if (pr.customFontCSS && pr.customFontCSS != ''){
				fontStyleTxt += ' font:'+pr.customFontCSS+';';
			}
			if (pr.customFontFamilyCSS && pr.customFontFamilyCSS != ''){
				fontStyleTxt += ' font-family:'+pr.customFontFamilyCSS+';';
			}
			var elementStyleCSS = '';
			if (pr.customStyleCSS && pr.customStyleCSS != ''){
				elementStyleCSS = ' '+pr.customStyleCSS+';';
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
			if (pr.fontsizeChange && pr.fontsizeChange != '' && pr.fontsizeChange != '100'){
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
			var titletext = '';
			if (pr.hovertitletext && pr.hovertitletext != ''){
				titletext += pr.hovertitletext.replace(/\"/g,'&quot;');
			}
			//if date select to variable
			if (pr.variableIsDate && pr.dimensionIsVariable){
				if ($("#sfsdatepicker").length>0){
					//ok
				} else {
					$( "<style id=sfsdatepicker>" ).html( cssDatepick ).appendTo( "head" ); //add css.
				}
				if (pr.variableName){
					if (debug){ console.log('alkuarvo ' + pr.variableName); console.log(app.variable.getContent(pr.variableName)); }
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
					html += 'value="'+varvalue+'" style="width:6em; max-width:80%;'+fontsizechanges+fontStyleTxt+elementStyleCSS+bordercolorstyle+elementpadding+'"' +elementExtraAttribute+ '/>';
					if (pr.postElemHtml){
						html += pr.postElemHtml;
					}
					if (pr.helptext){
						html += '<div class="sfs_helptxt">'+ pr.helptext + '</div>';
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
					if(pr.visInputFieldType=='range') html += varvalue+' ';
					if (titletext != ''){
						html += titletext; //escape quotas!!
					}
					html += '"';
					if (datalist) html += ' list="'+datalistID+'"';
					if (pr.visInputPlaceholdertxt && pr.visInputPlaceholdertxt != ''){
						html += ' placeholder="'+pr.visInputPlaceholdertxt.replace(/\"/g,'&quot;')+'"'; //escape quotas!!
					}
					html += ' class="sfe htmlin '+createLUIclass(pr.addLUIclasses,visType,pr.visInputFieldType)+elementExtraClass+'" value="'+varvalue+'" style="'+fontsizechanges+fontStyleTxt+elementStyleCSS+bordercolorstyle+elementpadding+containerStyles+'"' +elementExtraAttribute+ '/>';
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
						html += '<div class="sfs_helptxt">'+ pr.helptext + '</div>';
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
				html += '<div class="'+objectCSSid+' sfe txtonly '+elementExtraClass+'"';
				if (titletext){
					html += ' title="'+titletext+'"'; //escape quotas!!
				}
				html += ' style="'+fontsizechanges+fontStyleTxt+elementStyleCSS+bordercolorstyle+elementpadding+containerStyles+'"' +elementExtraAttribute+'>';
				if (pr.textareaonlytext) html += pr.textareaonlytext;
				if (pr.textareaonlytext2) html += pr.textareaonlytext2;
				if (pr.helptext){
					html += '<div class="sfs_helptxt">'+ pr.helptext + '</div>';
				}
				html += '</div>';
				if (pr.postElemHtml){
					html += pr.postElemHtml;
				}
				$element.html( html );
			//not date or html input:
			} else {
				
				if(visType=='luiswitch' || visType=='luicheckbox' || visType=='luiradio'){
					html += '<div class="sfs_lui '+objectCSSid+'"';
				} else {
					html += '<div class="checkboxgroup '+objectCSSid+'"';
				}
				if (titletext){
					html += ' title="'+titletext+'"'; //escape quotas!!
				}
				html += '>';
				var countselected = 0;
				var stylechanges = ' style="'+fontsizechanges+fontStyleTxt+containerStyles+'"';
				var multiselect = ''; //dropdown multi
				if (pr.selectmultiselect && !pr.dimensionIsVariable) {
					multiselect = ' multiple="multiple"';
					elementExtraClass = ' ddmulti '+elementExtraClass;
				}
				if (visType=='vlist'){
					html += '<ul'+stylechanges+'>';
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
						displayastableClass = ' ulastable'
					}
					html += '<ul class="horizontal'+roundcornerClass+rmarginclass+displayastableClass+'" '+stylechanges+'>';
				} else if (visType=='checkbox' || visType=='radio'){
					html += '<div '+stylechanges+'>';
				} else if (visType=='dropdown'){
					if (pr.preElemHtml){
						html += pr.preElemHtml;
					}
					html += '<select class="dropdownsel'+elementExtraClass+createLUIclass(pr.addLUIclasses,visType,'')+'" style="'+fontsizechanges+fontStyleTxt+elementStyleCSS+bordercolorstyle+elementpadding+containerStyles+'"' +elementExtraAttribute+multiselect+ '>';
				} else if (visType=='select2'){
					if (pr.preElemHtml){
						html += pr.preElemHtml;
					}
					html += '<select class="dropdownsel'+elementExtraClass+createLUIclass(pr.addLUIclasses,visType,'')+'" style="'+fontsizechanges+fontStyleTxt+elementStyleCSS+bordercolorstyle+containerStyles+'"' +elementExtraAttribute+multiselect+ '>'; //no elementpadding
				} else if (visType=='btn'){
					html += '<div '+stylechanges+'>';
				} else if (visType=='luiswitch' || visType=='luicheckbox' || visType=='luiradio'){

				} else {
					html += 'Select visualization type';
				}
				
				//print elements
				var optionsforselect = [];
				if (pr.dimensionIsVariable){
					//generate variable options from field
					if (debug) console.log('variable value '+varvalue);
					if (!pr.variableOptionsForValues){
						html += 'Set variable options or enable date selector or switch to HTML standard input visualization';
					}
					if (pr.variableName =='' || !pr.variableName){
						html += ' <br /> Invalid variable name.';
					}
					var splitted = pr.variableOptionsForValues.split(";");
					var varindex = 0; //index is used to access variable
					//create lists for variable values
					pr.variableOptionsForValuesArray = [];
					pr.variableOptionsForKeysArray = [];
					splitted.forEach(function(opt){
						var qState = 'O';
						//if values match with current, mark selected
						if (varvalue == opt) {
							qState = 'S'; 
						} //build qlik style object for printing
						optionsforselect.push( [{qState:qState, qText:opt, qElemNumber:varindex}] );
						pr.variableOptionsForValuesArray.push(opt); //when setting variable, take value from here.
						varindex += 1;
					});
					if (debug){ console.log(pr.variableOptionsForValues); }
					//if separate Keys variable is defined:
					var varKeyindex = 0;
					if (pr.dimensionIsVariable && pr.variableOptionsForKeys != ''){
						splitted = pr.variableOptionsForKeys.split(";");
						splitted.forEach(function(opt){
							pr.variableOptionsForKeysArray.push(opt); //when setting variable, take value from here.
							varKeyindex += 1;
						});
						if (varindex != varKeyindex){
							console.log('variable values and key options do not match. Values: '+varindex + ' vs. keys: '+varKeyindex);
							pr.variableOptionsForKeysArray = []; //reset array
						}
					}
					
				//if not variable:
				} else {
					optionsforselect = matrixdata;
				}
				//dropdown default option
				var visTypedropdownOrSelect2 = visType=='dropdown' || visType=='select2';
				if ((visTypedropdownOrSelect2) && !pr.selectmultiselect && pr.dropdownValueForNoSelect && pr.dropdownValueForNoSelect != ''){
					html += '<option class="state0" dval="" value=""> ' + pr.dropdownValueForNoSelect;
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
				//paint options
				optionsforselect.forEach( function ( row ) {
					if (pr.hidePassiveItems && !pr.dimensionIsVariable && row[0].qState === 'X'){ //if passive hiding enabled
						return; //exit current function
					}
					if(pr.removeLabel){
						row[0].qText = '';
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
					if (pr.selectOnlyOne && !pr.dimensionIsVariable && countselected > 1){
						if (debug) console.log('Select only one enabled, reducing selections.');
						checkedstatus = ''; selectedClass = ''; dropselection = '';
						if (visTypedropdownOrSelect2){
						  //self.backendApi.selectValues( 0, [ row[0].qElemNumber ], false );
						  selectValueInQlik(self,row[0].qElemNumber,layout,app,false);
						} else {
						  //self.backendApi.selectValues( 0, [ row[0].qElemNumber ], false );
						  selectValueInQlik(self,row[0].qElemNumber,layout,app,false);
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
					//if ((visType!='dropdown' && visType!='select2') || pr.selectmultiselect ){
					
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
					elementstyle += bordercolorstyle+elementStyleCSS+elementpadding;
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
						html += ' class="sfe sfsbtn state' + row[0].qState +defaultelementclass+selectedClass+colorclasses+elementExtraClass+otherdefaultelementclass+ createLUIclass(pr.addLUIclasses,visType,pr.visInputFieldType)+'" dval="' + row[0].qElemNumber + '"' + dis + ' ' +elementExtraAttribute+ '> ' + row[0].qText; //
						html += '</button> ';
					//radio
					} else if (visType=='radio'){
						html += '<label'+elementstyle+' class="sfe">'
						html += '<input type="radio" name="sfs'+layout.qInfo.qId+'" class="state' + row[0].qState +defaultelementclass+elementExtraClass+otherdefaultelementclass+selectedClass+colorclasses+ '" dval="' + row[0].qElemNumber + '"' + dis + checkedstatus +' ' +elementExtraAttribute+ '/> ' + row[0].qText; //
						html += '</label>';
					} else if (visTypedropdownOrSelect2){
						html += '<option '+elementstyle+'class="data state' + row[0].qState +defaultelementclass+otherdefaultelementclass+selectedClass+colorclasses+ '" dval="' + row[0].qElemNumber + '" value="' + row[0].qElemNumber + '"' + dis + dropselection + ' > ' + row[0].qText;
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
					html += '<div class="sfs_helptxt">'+ pr.helptext + '</div>';
				}
				if(paddingDivAdded) html += '</div>';
				var showContextMenu = 0;
				if (pr.rightclikcmenu && !pr.dimensionIsVariable && (visType=='hlist' || visType=='vlist' || visType=='checkbox' || (visTypedropdownOrSelect2 && pr.selectmultiselect) )) {
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
					if(layout.props.rightclikcmenu_selall) contextmenuHtml += '<li act="all">Select all</li>';
					if(layout.props.rightclikcmenu_clear) contextmenuHtml += '<li act="clear">Clear selections</li>';
					if(layout.props.rightclikcmenu_reverse) contextmenuHtml += '<li act="reverse">Reverse selection</li>';
					if(layout.props.rightclikcmenu_possible) contextmenuHtml += '<li act="possible">Select possible</li>';
					if(layout.props.rightclikcmenu_random) contextmenuHtml += '<li act="random">Select randomnly</li>';
					if(layout.props.rightclikcmenu_defaults) contextmenuHtml += '<li act="defaults">Select defaults</li>';
					if(layout.props.rightclikcmenu_getselectionurl){contextmenuHtml += '<li act="getselectionurl">Get URL for current state</li>';}
					if(layout.props.rightclikcmenu_getselurltoclipboard){contextmenuHtml += '<li act="getselectionurlclip">Get URL for current state to clipboard</li>';}
					
					contextmenuHtml += '</ul></div>';
					$('body').append(contextmenuHtml);
					sfsrmenu = $("."+contextmenuID);
					if (debug) console.log('set contextmenu action on');
					$element.on("contextmenu", function (event) {
						if (debug) console.log('show contextmenu '+contextmenuID);
						event.preventDefault();
						sfsrmenu.finish().toggle(100).
							css({top: event.pageY + "px", left: event.pageX + "px"});
						
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

								selectValuesInQlik(self, valuesToSelect ,layout,app,false);
								return;
							}
						});
						$(document).on("mousedown", document, hidermenu);
					});
					function hidermenu(e){ //hide menu
						if (!$(e.target).parents("."+contextmenuID).length > 0) { //+contextmenuID
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
								selectValuesInQlik(self, valuesToSelect ,layout,app,false);
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
						var kohteenValueID = parseInt(clicktarget.attr( "dval" ),10);
						if (debug) console.log('qv active on list change');

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
							if (layout.props.dimensionIsVariable && layout.props.variableEmptyAlreadySelected){ //for variable "clean"
								selectValueInQlik(self,kohteenValueID,layout,app,true);
							} else {
								if (layout.props.dimensionIsVariable){ //layout.props.selectOnlyOne
									if (debug) console.log('no selection change');
								} else {
									if (debug) console.log('de selecting');
									clicktarget.removeClass('selected');
									selectValueInQlik(self,kohteenValueID,layout,app,true);
									var selectedCount = 0;
									$element.find( '.selected' ).each(function(){
									  selectedCount += 1;
									});
									checkDefaultValueSelection($element,selectedCount,layout,self,app);
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
							var kohteenValueID = parseInt(clicktarget.val(),10);
							$element.find( '.selected' ).each(function(){ //clear others
								var value = parseInt( $(this).val(), 10 );
								if (value != kohteenValueID){
								  selectValueInQlik(self,value,layout,app,true);
								  $(this).removeClass('selected');
								}
							});
							clicktarget.addClass('selected').prop('selected',true);
							selectValueInQlik(self,kohteenValueID,layout,app,true);
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
							selectValuesInQlik(self, valuesToSelect ,layout,app,false);
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
						  var kohteenValueID = parseInt(clicktarget.attr( "dval" ),10);
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
								clicktarget.prop('checked',true).addClass('selected');
							}
							selectValueInQlik(self,kohteenValueID,layout,app,true);
						  //remove check from box
						  } else {
							  //deselect
							  if (debug) console.log('deseelct');
							  //var value = parseInt( $(this).attr( "dval" ), 10 );
							  clicktarget.prop('checked',false).removeClass('selected');
							  if (debug) console.log(clicktarget.attr("dval"));
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
				if (visType=='btn'){
					$element.find( 'button' ).on( 'click', function () {
						if (debug) console.log('Button clicked action');
						var clicktarget = $(this);
						if ( $(this).attr( "dval" ) ) {
							var kohteenValueID = parseInt(clicktarget.attr( "dval" ),10);
							var value = parseInt( clicktarget.attr( "dval" ), 10 );
							selectValueInQlik(self,value,layout,app,true);
						}
					} );
				//radio action
				} else if (visType=='radio' || visType=='luiradio'){
					$element.find( 'input' ).on('click',function(){
						if (debug) console.log('radio change action');
						var clicktarget = $(this);
						var kohteenValueID = parseInt(clicktarget.attr( "dval" ),10);
						$element.find( '.selected' ).each(function(){
								var value = parseInt( $(this).attr( "dval" ), 10 );
								if (value != kohteenValueID){
								  selectValueInQlik(self,value,layout,app,true);
								  $(this).removeClass('selected');
								}
						});
						clicktarget.addClass('selected').prop('selected',true);
						selectValueInQlik(self,kohteenValueID,layout,app,true);
					});

				} //if
				//sea
				//as default:
				checkDefaultValueSelection($element,countselected,layout,self,app);
			}
			//select2 init
			if (visType=='select2'){
				if(debug) console.log('init select2')
				if ($("#sfsselect2").length>0){
					//ok
				} else {
					$( "<style id=sfsselect2>" ).html( select2css ).appendTo( "head" ); //add css.
					$( "<div id=sfsselect2c class=qv-object-SimpleFieldSelect>" ).html( "" ).appendTo( "body" ); //add css.
				}
				var minimumSearchResults = Infinity;
				if (layout.props.select2enableSerach){
					minimumSearchResults = 0;
				}
				$("#sfsselect2c").html(""); //clear area, select2 may not
				var selectElement = $element.find( '.dropdownsel' );
				selectElement.select2({
					'dropdownParent': $("#sfsselect2c"),
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
						selectValuesInQlik(self, valuesToSelect ,layout,app,false);
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
			//curent selections to url
			function getSelectedUrl(dialogOrClipboard){
				if(debug) console.log('get selected to url');
				
			}

			function hideGetSelUrlFromESC(e){
				if (e.keyCode == 27) {
					$("#sfsgetselurl").hide();
					$(document).off("keydown",hideGetSelUrlFromESC);
				}
			}
			/*var storedObject = null;
			$('.qv-gridcell').on('click',function(e){
				e.preventDefault();
				var parentdiv = $(e.target).closest('.qv-gridcell');
				var objectID = parentdiv.attr('tid');
				if (objectID){
					console.log(objectID+' '+storedObject); //.closest('div:has(*[tid])')
					if (objectID==storedObject){} 
					else {
						parentdiv.attr('id',objectID);
						qBlob.saveToFile(objectID, objectID+'output.png');
						storedObject = objectID;
					}
				}
			});
			//
			$(document).on('click',function(e){
				function downloadURI(uri, name) {
			        var link = document.createElement("a");
			        link.download = name;
			        link.href = uri;
			        link.click();
			        //after creating link you should delete dynamic link
			        //clearDynamicLink(link); 
			    }

			    if (e.target){
			    	
			    } else {
			    	return;
			    }
			    var div = $(e.target).html();
			    
			    var canvas = $('<canvas/>').attr('id','canvasid').html(div);
			    //$('body').append(canvas);
			    //console.log(canvas);
			    printToFile(canvas[0]) ;
			    //Your modified code.
			    function printToFile(canvasdata) {
			    	//console.log(canvasdata);
			        
			        //div = document.getElementById("canvasid"); 
			        var myImage = canvasdata.toDataURL("image/png");
			        console.log(canvasdata.toDataURL());
			        downloadURI("data:" + myImage, "yourImage.png");
			    }
			});*/
			return qlik.Promise.resolve();
		}
	};
} );

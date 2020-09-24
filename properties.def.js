//Properties definitions
define( [], function () {
	'use strict';
	var debug = false;
	//calc variable name IF this is variable selection - should be removed and changed
	function findVariableName(listobject,props){
		props.variableName = listobject.qDef.qFieldDefs[0];
		if (typeof props.variableName == 'object'){
			if(debug) console.log('set from expr');
			if ((listobject.qDef.qFieldDefs[0].qStringExpression.qExpr)){
				props.variableName = listobject.qDef.qFieldDefs[0].qStringExpression.qExpr;
			} else {
				props.variableName ='';
			}
		}
		if (debug) console.log('Var type:'+ typeof props.variableName);
		if (typeof props.variableName == 'string' && props.variableName){
			props.variableName = props.variableName.replace("=",'');
		} else {
			props.variableName = '';
		}
		if(debug){ console.log(listobject); console.log(props); console.log(listobject.qDef.qFieldDefs[0]);}
		if (props.hideFromSelectionRealField && props.hideFromSelectionRealField != ''){
			props.variableName = props.hideFromSelectionRealField;
		}
		/*if (props.variableName == '' || !props.variableName){
			props.variableName = listobject.qDef.qFieldDefs[0];
			if(debug){ console.log(typeof props.variableName); }
			if (typeof props.variableName !== 'undefined' && typeof props.variableName !== 'object'){
				props.variableName = props.variableName.replace("=",'');
			} else {
				props.variableName = '';
			}
		}*/
		props.variableName = props.variableName.trim();
		listobject.qDef.qFieldDefs[0] = props.variableName; //set back
	}
	function findVariableValue(data){
		data.variableValue = data.variableValue || {};
		if (data.props.variableName && typeof data.props.variableName !== 'object'){
			data.variableValue.qStringExpression = '="' + data.props.variableName+'"';
		} else {
			data.variableValue.qStringExpression = '';
		}
		if(debug){ console.log('variable name is '+data.props.variableName); console.log('variable expression: '+data.variableValue.qStringExpression); console.log(data);}
	}
	var paddingoptions = [{value: "-",label: "default"},{value: "0",label: "0px"},{value: "2",label: "2px"},
									{value: "4",label: "4px"},{value: "6",label: "6px"},{value: "8",label: "8px"},
									{value: "10",label: "10px"},{value: "12",label: "12px"},{value: "16",label: "16px"}];
	var paddingoptions2 = [{value: "-",label: "default"},{value: "2",label: "2px"},{value: "4",label: "4px"},{value: "5",label: "5px"},{value: "6",label: "6px"},
									{value: "8",label: "8px"},	{value: "10",label: "10px"},{value: "14",label: "14px"},{value: "15",label: "15px"},{value: "18",label: "18px"},
									{value: "20",label: "20px"},{value: "22",label: "22px"},{value: "26",label: "26px"},{value: "30",label: "30px"},
									{value: "36",label: "36px"},{value: "42",label: "42px"},{value: "50",label: "50px"}];
	var sortoptions = [	{value: 1,label: "Ascending"},	{value: 0,label: "No"},	{value: -1,label: "Descending"}];
	var padandheader = {
		type: "items",
		label: "Paddings and header",
		grouped:true,
		items: {
			containercontent: {
				type: "items",
				items: {
					contentpadding: {
						type: "string",
						component: "dropdown",
						label: "Padding for the content",
						ref: "props.contentpadding",
						options: paddingoptions,
						defaultValue: "-"
					},
					leftpadding: {
						type: "string",
						component: "dropdown",
						label: "Left padding, default margin",
						ref: "props.leftpadding",
						options: paddingoptions,
						defaultValue: "-"
					},
					bottompadding: {
						type: "string",
						component: "dropdown",
						label: "Bottom padding, default margin",
						ref: "props.bottompadding",
						options: paddingoptions,
						defaultValue: "-"
					},
					rightpadding: {
						type: "string",
						component: "dropdown",
						label: "Right padding, default margin",
						ref: "props.rightpadding",
						options: paddingoptions,
						defaultValue: "-"
					},
					toppadding: {
						type: "string",
						component: "dropdown",
						label: "Top padding, default margin",
						ref: "props.toppadding",
						options: paddingoptions,
						defaultValue: "-"
					},
					custompadding:{
						type: "string",
						label: "Custom padding, CSS style (2px or 0px 4px 0px 5px)",
						ref: "props.custompadding",
						defaultValue: '',
						expression:"optional"
					},
					showHeader: {
					  ref: "props.showHeader",
					  type: "boolean",
					  label: "Show default header?",
					  defaultValue: true
					  /*change: function(data){
					  	$("#sfs"+data.qInfo.qId).parent().parent().parent().prev().toggle();
					  }*/
					},
					headerheightsize: {
						type: "string",
						component: "dropdown",
						label: "Header height in pixels",
						ref: "props.headerSize",
						options: paddingoptions2,
						defaultValue: "-",
						show: function ( data ) {
							return data.qListObjectDef && data.props &&  data.props.showHeader;
						}
					},
					headerbottompadding: {
						type: "string",
						component: "dropdown",
						label: "Header bottom padding",
						ref: "props.headerBpadding",
						options: paddingoptions2,
						defaultValue: "-",
						show: function ( data ) {
							return data.qListObjectDef && data.props &&  data.props.showHeader;
						}
					},
					headertoppadding: {
						type: "string",
						component: "dropdown",
						label: "Header H1 top padding (global will overwrite this)",
						ref: "props.headerTpadding",
						options: paddingoptions2,
						defaultValue: "-",
						show: function ( data ) {
							return data.qListObjectDef && data.props &&  data.props.showHeader;
						}
					}
				}
			},
			objectlvlsettings: {
				type: "items",
				items: {
					objectlvltxt: {
						component: "text",label: "Element level settings"
					},
					elementpadding: {
						type:"number",
						//type: "string",
						//component: "dropdown",
						label: "Padding for the element (px, inside)",
						ref: "props.elementpadding",
						//options: paddingoptions,
						defaultValue: 0
					},
					elementmargin: {
						type:"number",
						//type: "string",
						//component: "dropdown",
						label: "Margin for the element (px, outside)",
						ref: "props.elementmargin",
						//options: paddingoptions,
						defaultValue: 0
					}
				}
			}
			
		}
	};
	var globalsettings = {
		component: "expandable-items",
		label: "Global modifications",
		
		items: {
			generalglobal:{
				type: "items",
				label: "Enable",
				items: {
					aboutglobal:{
						component: "text",
						label: "Global modifications let you to customize overall visual theme of the document. You don't need a separate extension for this. Only one Simple Field Select element should have global parameters enabled on one sheet. If you disable, reload page."
					},
					enableGlobals: {
						ref: "props.enableGlobals",
						component: "switch",
						type: "boolean",
						label: "Enable global modifications?",
						defaultValue: false,
						options: [{value: true,label: "Enabled"}, {value: false,label: "Disabled"}]
					},
					propagationInfo:{
						component: "text",
						label: "Most of the following settings are inherited from this sheet to others when user changes sheet. You need to have same settings on other sheets too to have the same effect on every possible landing sheet. Use master items for same settings on every sheet. Changing some of the values back to default requires browser refresh.",
					},
					errorglobal: { //cannot be shown when editing masterobject
						component: "text",
						label: "This sheet has two or more global modifications enabled. Use only one",
						show: function(){
							return $(".sfsglobalcss").length>1;
						}
					}
				}
			},
			globalSheet: {
				type: "items",
				label: "Sheet settings",
				show: function ( data ) {
					return  data.props && data.props.enableGlobals ;
				},
				items: {
					global_bgcolor: {
						type: "string",
						label: "Sheet background color",
						ref: "props.global_bgcolor",
						defaultValue: '',
						expression:"optional"
					},
					/*global_bgcolor2: {
						type: "string",
						label: "Sheet background color 2",
						ref: "props.global_bgcolor2",
						defaultValue: '',
						expression:"optional"
					},*/
					global_bgcss: {
						type: "string",
						label: "Sheet background CSS",
						ref: "props.global_bgcss",
						defaultValue: '',
						expression:"optional"
					},
					global_bgcss2: {
						type: "string",
						label: "Sheet background CSS, sticky with extended sheet",
						ref: "props.global_bgcss2",
						defaultValue: '',
						expression:"optional"
					},
					global_bghtmlinfo:{
						component: "text",
						label: "Sheet background HTML: If used, there will be full size container created which CSS can be controlled. Inside this container following HTML content will be inserted. \nExample: "+'<div style="background-color:green; width:100%;height:100px;"></div><div style="background-color:#A29723; width:calc(100% - 8px);height:calc(100% - 100px); border:4px solid green;"></div><div style="position:fixed; bottom:20px; left:25px; background-color:#d7d7d7;color:#ee1145;padding:10px;border-radius:10px;z-index:1300;">Notice! There is this kind of info box</div>',
					},
					global_bghtml: {
						type:"string",
						component:"textarea",
						label: "Sheet background extra HTML element",
						ref:"props.global_bghtml",
						defaultValue:'',
						expression:'optional'
					},
					global_bghtmlcss: {
						type:"string",
						component:"textarea",
						label: "CSS for Sheet background extra HTML element -container",
						ref:"props.global_bghtmlcss",
						defaultValue:'',
						expression:'optional'
					},
					global_fontcolor: {
						type: "string",
						label: "Font color for the sheet",
						ref: "props.global_fontcolor",
						defaultValue: '',
						expression:"optional"
					},
					fontfamily_global: {
					  ref: "props.fontfamily_global",
					  type: "string",
					  label: "Font-family css parameter for the whole sheet",
					  defaultValue: ""
					},
					hideSheetTitle: {
					  ref: "props.hideSheetTitle",
					  component: "switch",
					  type: "boolean",
					  label: "Hide sheet title?",
					  defaultValue: false,
					  options: [{value: true,label: "Hide"}, {value: false,label: "Show"}],
					  change: function(data){
					  	if (!data.props.hideSheetTitle){
					  		$(".sheet-title-container").show();
					  	}
					  }
					},
					removeSheetTitlePadding: {
					  ref: "props.removeSheetTitlePadding",
					  component: "switch",
					  type: "boolean",
					  label: "Remove sheet title padding?",
					  defaultValue: false,
					  options: [{value: true,label: "Remove padding"}, {value: false,label: "Default padding"}],
					  show: function ( data ) {
							return  data.props && !data.props.hideSheetTitle;
					  }
					},
					sheetTitleFontSize: {
					  ref: "props.sheetTitleFontSize",
					  //component: "dropdown",
					  label: "Sheet title font size in px (-1 default)",
					  type: "integer",expression:"optional",
					  defaultValue: -1,
					  show: function ( data ) {
							return data.props  && !data.props.hideSheetTitle;
					  }
					},
					sheetTitleheight: {
					  ref: "props.sheetTitleheight",
					  //component: "dropdown",
					  label: "Sheet title height in px (-1 default)",
					  type: "integer",expression:"optional",
					  defaultValue: -1,
					  show: function ( data ) {
							return !data.props.hideSheetTitle;
					  }
					},
					sheetTitleExtraText: {
					  ref: "props.sheetTitleExtraText",
					  expression:"optional",
					  type: "string",
					  label: "Sheet title extra text element",
					  defaultValue: '',
					  show: function ( data ) {
							return  !data.props.hideSheetTitle;
					  }
					},
					sheetTitleCSS: {
					  ref: "props.sheetTitleCSS",
					  expression:"optional",
					  type: "string",
					  label: "Custom sheet title CSS (example: height:100px;)",
					  defaultValue: '',
					  show: function ( data ) {
							return  !data.props.hideSheetTitle;
					  }
					}
				}
			},
			globalother: {
				type: "items",
				label: "Other",
				show: function ( data ) {
					return  data.props && data.props.enableGlobals ;
				},
				items: {
					hidepivotTableSelectors: {
					  ref: "props.hidepivotTableSelectors", component: "switch", type: "boolean", label: "Pivot table, remove \"selectors\"", defaultValue: false,
					  options: [{value: true,label: "Remove"}, {value: false,label: "Default"}]
					},
					hideFieldsFromSelectionBar: {
					  ref: "props.hideFieldsFromSelectionBar",
					  type: "string",
					  label: "Hide following fields from the selection bar. Separate by ;",
					  defaultValue: ""
					},
					clearAllSelOnFirstLoad: {
					  ref: "props.clearAllSelOnFirstLoad",
					  type: "boolean",
					  label: "Clear all selections on first load / refresh",
					  defaultValue: false
					},
					clearAllSelOnLeave: {
					  ref: "props.clearAllSelOnLeave",
					  type: "boolean",
					  label: "Clear all selections on sheet leave (requires refresh after this setting has been changed)",
					  defaultValue: false
					},
					keepaliver: {
					  ref: "props.keepaliver",
					  label: "Keepalive, send message to server in minutes",
					  type: "integer",
					  expression:"optional",
					  defaultValue: 0
					},
					global_customCSS: {
					  ref: "props.global_customCSS",
					  label: "Custom CSS",
					  type: "string",
					  expression:"optional",
					  defaultValue: ''
					}
				}

			},
			globalselections: {
				type: "items",
				label: "Qlik native selections",
				show: function ( data ) {
					return  data.props && data.props.enableGlobals ;
				},
				items: {
					global_qnseltxt: { //cannot be shown when editing masterobject
						component: "text",
						label: "Qlik native filter and current selections color settings",
						show: function(){
							return $(".sfsglobalcss").length>1;
						}
					},
					global_selectBGcolor:{
						type: "string",
						label: "Background color (red, #123455, rgb(1,2,3))",
						ref: "props.global_selectBGcolor",
						defaultValue: '',
						expression:"optional"
					},
					global_selectFontcolor:{
						type: "string",
						label: "Text color",
						ref: "props.global_selectFontcolor",
						defaultValue: '',
						expression:"optional"
					},
					global_selectBordercolor:{
						type: "string",
						label: "Border color",
						ref: "props.global_selectBordercolor",
						defaultValue: '',
						expression:"optional"
					},
				}
			},
			globalsfs: {
				type: "items",
				label: "Global settings for SimpleFieldSelect elements",
				show: function ( data ) {
					return  data.props && data.props.enableGlobals ;
				},
				items: {
					globsfs_text: { //cannot be shown when editing masterobject
						component: "text",
						label: "Local setting of each SFS will override these"
					},
					globsfs_stateS_bg: {
						type: "string",
						label: "Selected background (Qlik green: #009845)",
						ref: "props.globsfs_stateS_bg",
						defaultValue: '',expression:"optional"
					},
					globsfs_stateO_bg: {
						type: "string",
						label: "Possible selection background",
						ref: "props.globsfs_stateO_bg",
						defaultValue: '',expression:"optional"
					},
					globsfs_stateA_bg: {
						type: "string",
						label: "Alternative selection background",
						ref: "props.globsfs_stateA_bg",
						defaultValue: '',expression:"optional"
					},
					globsfs_stateX_bg: {
						type: "string",
						label: "Excluded selection background",
						ref: "props.globsfs_stateX_bg",
						defaultValue: '',expression:"optional"
					},
					glob_fontcolors:{
						component: "text",
						label: "Font colors"
					},
					globsfs_stateS_fo: {
						type: "string",
						label: "Selected text color",
						ref: "props.globsfs_stateS_fo",
						defaultValue: '',expression:"optional"
					},
					globsfs_stateO_fo: {
						type: "string",
						label: "Possible selection text color",
						ref: "props.globsfs_stateO_fo",
						defaultValue: '',expression:"optional"
					},
					globsfs_stateA_fo: {
						type: "string",
						label: "Alternative selection text color",
						ref: "props.globsfs_stateA_fo",
						defaultValue: '',expression:"optional"
					},
					globsfs_stateX_fo: {
						type: "string",
						label: "Excluded selection text color",
						ref: "props.globsfs_stateX_fo",
						defaultValue: '',expression:"optional"
					},
					othercolors:{
						component: "text",
						label: "Other colors"
					},
					globsfs_border: {
						type: "string",
						label: "Border color of an input",
						ref: "props.globsfs_border",
						defaultValue: '', expression:"optional"
					},
					globsfs_hoverBG:{
						type: "string",
						label: "Hover background color",
						ref: "props.globsfs_hoverBG",
						defaultValue: '', expression:"optional",
						show: function(data){
							return !(data.props.visualizationType=='dropdown' || data.props.visualizationType=='select2');
						}
					},
					globsfs_hoverFontcolor:{
						type: "string",
						label: "Hover font color",
						ref: "props.globsfs_hoverFontcolor",
						defaultValue: '', expression:"optional",
						show: function(data){
							return !(data.props.visualizationType=='dropdown' || data.props.visualizationType=='select2');
						}
						
					},
					glob_paddings:{
						component: "text",
						label: "Paddings - use values like 2px or 1em"
					},
					/*globsfs_contentpad: {
						type: "string",
						label: "Padding for the content",
						ref: "props.globsfs_contentpad",
						defaultValue: '',expression:'optional'
					},*/
					globsfs_leftpad: {
						type: "string",
						label: "Left padding, default margin",
						ref: "props.globsfs_leftpad",
						defaultValue: '',expression:'optional'
					},
					globsfs_bottompad: {
						type: "string",
						label: "Bottom padding, default margin",
						ref: "props.globsfs_bottompad",
						defaultValue: '',expression:'optional'
					},
					globsfs_rightpad: {
						type: "string",
						label: "Right padding, default margin",
						ref: "props.globsfs_rightpad",
						defaultValue: '',expression:'optional'
					},
					globsfs_toppad: {
						type: "string",
						label: "Top padding, default margin",
						ref: "props.globsfs_toppad",
						defaultValue: '',
						expression:'optional'
					},
					globsfs_custompad:{
						type: "string",
						label: "Custom padding, CSS style (2px or 0px 4px 0px 5px)",
						ref: "props.globsfs_custompad",
						defaultValue: '', expression:'optional'
					},
				}
			},
			globalmobile: {
				type: "items",
				label: "Mobile view settings",
				show: function ( data ) {
					return  data.props && data.props.enableGlobals ;
				},
				items: {
					removeMobileZoom: {
					  ref: "props.gremoveMobileZoom",
					  type: "boolean",
					  label: "Disable mobile zoom/maximize effect from all objects? (less clicking)",
					  defaultValue: false
					},
					hideMobileSearch: {
						ref: "props.ghideMobileSearch",
						type: "integer",
						label: "Hide search field from mobile (1 to hide)",
						defaultValue: 0,
						expression:"optional"
					},
					hideMobileHeader: {
						ref: "props.ghideMobileHeader",
						type: "integer",
						label: "Hide top header from mobile (1 to hide)",
						defaultValue: 0,
						expression:"optional"
					},
					hideMobileFooter: {
						ref: "props.ghideMobileFooter",
						type: "integer",
						label: "Hide bottom header from mobile (1 to hide)",
						defaultValue: 0,
						expression:"optional"
					}
				}
			},
			selectionandcontrol: {
				type: "items",
				label: "Selection bar and controls",
				show: function ( data ) {
					return  data.props && data.props.enableGlobals ;
				},
				items: {
					hideSelectionBar: {
					  ref: "props.hideSelectionBar",
					  component: "switch",
					  type: "boolean",
					  label: "Hide whole selection bar?",
					  defaultValue: false,
					  options: [{value: true,label: "Hide"}, {value: false,label: "Show"}],
					  change: function(data){
					  	if (!data.props.hideSelectionBar){
					  		$(".qvt-selections").show();
					  	}
					  }
					},
					selBarExtraText: {
					  ref: "props.selBarExtraText",
					  expression:"optional",
					  type: "string",
					  label: "Selection bar extra text element",
					  defaultValue: '',
					  show: function ( data ) {	return !data.props.hideSelectionBar; }
					},
					selBarExtraTextcss: {
					  ref: "props.selBarExtraTextcss",
					  expression:"optional",
					  type: "string",
					  label: "Custom CSS for Selection bar extra text",
					  defaultValue: '',
					  show: function ( data ) {	return !data.props.hideSelectionBar; }
					},
					selBarExtraTextQlikStyle: {
					  ref: "props.selBarExtraTextQlikStyle",
					  type: "boolean",
					  label: "Apply Qlik style to Selection bar extra text",
					  defaultValue: false,
					  show: function ( data ) {
							return !data.props.hideSelectionBar;
					  }
					},
					hideInsightsButton: {
					  ref: "props.hideInsightsButton", component: "switch", type: "boolean", label: "Hide Insights button", defaultValue: false,
					  options: [{value: true,label: "Hide"}, {value: false,label: "Default"}],show: function ( data ) {	return !data.props.hideSelectionBar; }
					},
					hideSelectionsTool: {
					  ref: "props.hideSelectionsTool",component: "switch", type: "boolean", label: "Hide Selections tool button", defaultValue: false,
					  options: [{value: true,label: "Hide"}, {value: false,label: "Default"}],show: function ( data ) {	return !data.props.hideSelectionBar; }
					},
					hideSmartSearchButton: {
					  ref: "props.hideSmartSearchButton",component: "switch", type: "boolean", label: "Hide Smart Search button", defaultValue: false,
					  options: [{value: true,label: "Hide"}, {value: false,label: "Default"}],show: function ( data ) {	return !data.props.hideSelectionBar; }
					},
					
					hideGuiToolbar: {
					  ref: "props.hideGuiToolbar",
					  component: "switch",
					  type: "boolean",
					  label: "Hide whole main toolbar? (requires page refresh after enabled)",
					  defaultValue: false,
					  options: [{value: true,label: "Hide"}, {value: false,label: "Show"}],
					  change: function(data){
					  	if (!data.props.hideGuiToolbar){
					  		$(".qui-toolbar").show();
					  	}
					  }
					},
					toolbarheight: {
					  ref: "props.toolbarheight",
					  //component: "dropdown",
					  label: "Main toolbar height in px (default -1)",
					  type: "integer",expression: "optional",
					  defaultValue: -1,
					  show: function ( data ) {
							return  !data.props.hideGuiToolbar;
					  }
					},
					toolbarTxt: {
					  ref: "props.toolbarTxt",
					  expression:"optional",
					  type: "string",
					  label: "Main toolbar extra text field",
					  defaultValue: '',
					  show: function ( data ) {
					  	return !data.props.hideGuiToolbar;
					  }
					},
					hideToolbarCenter: {
					  ref: "props.hideToolbarCenter",
					  component: "switch",
					  type: "boolean",
					  label: "Hide center part of main toolbar? (data, analysis, story)",
					  defaultValue: false,
					  options: [{value: true,label: "Hide"}, {value: false,label: "Show"}],
					  show: function ( data ) {
					  	return !data.props.hideGuiToolbar;
					  }
					},
					hideToolbarCenterPerm: {
					  ref: "props.hideToolbarCenterPerm",
					  type: "boolean",
					  label: "Hide center permanently (deletes element, first seen -> removed, appears on page refresh or if landing sheet without this option)",
					  defaultValue: false,
					  show: function ( data ) {
							return data.props.hideToolbarCenter && !data.props.hideGuiToolbar;
					  }
					},
					hideguitoolbarInfo:{
						component: "text",
						label: "Refresh page. When main toolbar is hidden you cannot access Edit mode. You have to change last part of the url to /state/edit . Toolbar will be hidden only when not in Edit mode.",
						show: function ( data ) {
							return data.props  && data.props.hideGuiToolbar;
					  }
					}
				}
			},
			globalobject: {
				type: "items",
				label: "Global object settings",
				show: function ( data ) {
					return  data.props && data.props.enableGlobals ;
				},
				items: {
					globalobjectgeneral:{
						component: "text",
						label: "Global object related modifications which will be applied to all objects on the sheet:"
					},
					global_customselector:{
						type: "string",
						label: "Custom selector, separate with ; (barchart, piechart, scatterplot, gauge, text-image)",
						ref: "props.global_customselector",
						defaultValue: '',
						expression:"optional"
					},
					global_elementbgcolor:{
						type: "string",
						label: "Object background color",
						ref: "props.global_elementbgcolor",
						defaultValue: '',
						expression:"optional"
					},
					global_customObjCSS:{
						type: "string",
						label: "Custom CSS style for every object",
						ref: "props.global_customObjCSS",
						defaultValue: '',
						expression:"optional"
					},
					global_cObjHeaderCSS: {
						type: "string",
						label: "Custom CSS style for header",
						ref: "props.global_cObjHeaderCSS",
						defaultValue: '',
						expression:"optional"
					},
					global_cObjHeaderTxtCSS: {
						type: "string",
						label: "Custom CSS style for header text (you may need to use !important to overwrite defaults)",
						ref: "props.global_cObjHeaderTxtCSS",
						defaultValue: '',
						expression:"optional"
					},
					global_objAxisCSS: {
						type: "string",
						label: "Custom CSS style for axis texts (you may need to use !important to overwrite defaults)",
						ref: "props.global_objAxisCSS",
						defaultValue: '',
						expression:"optional"
					},
					globalobjectgeneral2:{
						component: "text",
						label: "Following will apply to all"
					},
					
					global_bordercolor: {
						type: "string",
						label: "Border color",
						ref: "props.global_bordercolor",
						defaultValue: '',
						expression:"optional"
					},
					global_bordercolor2: {
						type: "string",
						label: "Border color 2",
						ref: "props.global_bordercolor2",
						defaultValue: '',
						expression:"optional"
					},
					global_borderwidth: {
						type: "string",
						component: "dropdown",
						label: "Border width",
						ref: "props.global_borderwidth",
						options: [
							{value: "-",label: "default"},
							{value: "0",label: "0px"},
							{value: "1",label: "1px"},
							{value: "2",label: "2px"},
							{value: "3",label: "3px"},
							{value: "4",label: "4px"},
							{value: "5",label: "5px"},
							{value: "6",label: "6px"},
							{value: "8",label: "8px"}],
						defaultValue: "-"
					},
					removeHeaderFromTextImageObjects: {
					  ref: "props.removeHeaderFromTextImageObjects",
					  component: "switch",
					  type: "boolean",
					  label: "Text & Image objects: remove header",
					  defaultValue: false,
					  options: [{value: true,label: "Remove headers"}, {value: false,label: "Default headers"}]
					},
					removeHeaderFromAllObjects: {
					  ref: "props.removeHeaderFromAllObjects",
					  component: "switch",
					  type: "boolean",
					  label: "Remove header from all objects",
					  defaultValue: false,
					  options: [{value: true,label: "Remove headers"}, {value: false,label: "Default headers"}]
					},
					removeHeaderIfNoText: {
					  ref: "props.removeHeaderIfNoText",
					  component: "switch",
					  type: "boolean",
					  label: "Remove header if empty (no header text)",
					  defaultValue: false,
					  options: [{value: true,label: "Remove"}, {value: false,label: "Default headers"}],
					  show: function ( data ) {
							return data.props && !data.props.removeHeaderFromAllObjects;
					  }
					},							
					headerfontcolor_global: {
						type: "string",
						label: "Header font color",
						ref: "props.headerfontcolor_global",
						defaultValue: '',
						expression:"optional",
						show: function ( data ) {
						 return  data.props && !data.props.removeHeaderFromAllObjects;
					    }
					},
					headerbgcolor_global: {
						type: "string",
						label: "Header background color",
						ref: "props.headerbgcolor_global",
						defaultValue: '',
						expression:"optional",
						show: function ( data ) {
						 return  data.props && !data.props.removeHeaderFromAllObjects;
					    }
					},
					
					headerpaddingAdjustTxt:{
						component: "text",
						label: "You can adjust sheet's every objects' padding settings of the default header (Focus Theme)."
					},
					headertoppadding_global: {
						type: "string",
						component: "dropdown",
						label: "Header top padding",
						ref: "props.headerTpadding_global",
						options: paddingoptions2,
						defaultValue: "-",
						show: function ( data ) {
							return data.props  && !data.props.removeHeaderFromAllObjects;
						}
					},
					headerbottompadding_global: {
						type: "string",
						component: "dropdown",
						label: "Header bottom padding",
						ref: "props.headerBpadding_global",
						options: paddingoptions2,
						defaultValue: "-",
						show: function ( data ) {
							return data.props  && !data.props.removeHeaderFromAllObjects;
						}
					},
					leftpadding_global: {
						type: "string",
						component: "dropdown",
						label: "Left padding, object content",
						ref: "props.leftpadding_global",
						options: paddingoptions,
						defaultValue: "-"
					},
					rightpadding_global: {
						type: "string",
						component: "dropdown",
						label: "Right padding, object content",
						ref: "props.rightpadding_global",
						options: paddingoptions,
						defaultValue: "-"
					}
				}
			}
		}
	};
	return {
		type: "items",
		component: "accordion",
		items: {
			dimensions: {
				type: "items",
				label: "Dimensions",
				ref: "qListObjectDef",
				min: 0,
				max: 1,
				items: {
					field: {
						type: "string",
						expression: "optional",
						expressionType: "dimension",
						ref: "qListObjectDef.qDef.qFieldDefs.0",
						label: "Field or variable name",
						show: function ( data ) {
							return data.qListObjectDef && !data.qListObjectDef.qLibraryId;
						},
						change: function(data) {
							if (data.props.dimensionIsVariable){
								findVariableName(data.qListObjectDef,data.props);
								findVariableValue(data);
								
							}
                        }
					},
					
					dimensionIsVariable: {
					  ref: "props.dimensionIsVariable",
					  type: "boolean",
					  label: "Target field is variable",
					  defaultValue: false,
					  change: function(data) {
						if (data.props.dimensionIsVariable){
							findVariableName(data.qListObjectDef,data.props);
							findVariableValue(data);
						}
                      }
                    },
                    variableIsDate: {
						ref: "props.variableIsDate",
						type: "boolean",
						label: "Variable is a date selector?",
						defaultValue: false,
						show: function ( data ) {
							return data.props && data.props.dimensionIsVariable;
						}
					},
					variableEmptyAlreadySelected: {
						ref: "props.variableEmptyAlreadySelected",
						type: "boolean",
						label: "Set variable to empty string when already selected is selected again?",
						defaultValue: false,
						show: function ( data ) {
							return data.props && data.props.dimensionIsVariable && !data.props.variableIsDate && data.props.visualizationType!='input';
						}
					},
                    VisualizationType: {
						type: "string",
						component: "dropdown",
						label: "Visualization",
						ref: "props.visualizationType",
						options: [{
							value: "checkbox",label: "Checkbox"}, {
							value: "vlist",label: "Vertical QlikSense list"}, {
							value: "hlist",label: "Horizontal QlikSense list"}, {
							value: "dropdown",label: "Dropdown"}, {
							value: "btn",label: "Standard HTML button"}, {
							value: "radio",label: "Standard HTML radio button"}, {
							value: "input",label: "Standard HTML5 input (numbers, text, sliders)"}, {
							value: "select2",label: "Select2 dropdown"}, {
							value: "luiswitch",label: "Qlik Switch"}, {
							value: "luicheckbox",label: "Qlik Checkbox"}, {
							value: "luiradio",label: "Qlik Radio button"}, {
							value: "txtonly",label: "Only a textarea"}, {
							value: "searchonly",label: "Only search and select"
							}
							//, {value: "actions",label: "Actions and functions"}
						],
						defaultValue: "hlist",
						show: function ( data ) {
							return data.qListObjectDef && data.props && !(data.props.dimensionIsVariable && data.props.variableIsDate );
						}
					},
					toggleMode: {
						ref: "props.disableToggleMode",
						type: "boolean",
						label: 'Disable toggle mode - if field is set in Qlik to "Always one selected value" - check this to make selections to work',
						defaultValue: false,
						show: function ( data ) {
							return data.props && !data.props.dimensionIsVariable && data.props.visualizationType!='txtonly';
						}

					},
					textareaonlytext: {
						component: "textarea",
						rows: 10,
						defaultValue: '',
						label: "Text",
						expression:"optional",
						ref: "props.textareaonlytext",
						maxlength: 2000,
						show: function ( data ) {
							return data.props.visualizationType=='txtonly';
						}
					},
					textareaonlyCSS: {
						component: "textarea",
						rows: 5,
						label: "CSS style for the container of the textarea",
						expression:"optional",
						ref: "props.textareaonlyCSS",
						maxlength: 2000,
						defaultValue: 'height:100%;',
						show: function ( data ) {
							return data.props.visualizationType=='txtonly';
						}
					},
					textareaonlytext2: {
						type: "string",
						defaultValue: '',
						label: "Another text (with expression possibility)",
						expression:"optional",
						ref: "props.textareaonlytext2",
						show: function ( data ) {
							return data.props.visualizationType=='txtonly';
						}
					},
					textareaonlyinfo:{
						component: "text",
						label: "Textarea can have html markup also. It may include javascript, like <script>alert('Hei');</script> ",
						show: function ( data ) {
							return data.props.visualizationType=='txtonly';
						}
					},
					textareaonlyinfo2:{
						component: "text",
						label: "or CSS element like: <div id=\"a\">Some text</div> <style>#a {background-color:green; color:#fff; padding:10px;}</style> Remember that do not break Qlik styles or code! Many settings of this extension do apply to this component too. Some parameters visible do not have effect.",
						show: function ( data ) {
							return data.props.visualizationType=='txtonly';
						}
					},

                    visInputFieldType: {
                    	ref: "props.visInputFieldType",
                    	component: "dropdown",
                    	label: "Input field type",
                    	options: [{
                    		value: "text",label: "Text"}, {
                    		value: "number",label: "Number"}, {
                    		value: "range",label: "Range slider"}, {
                    		value: "color",label: "Color"}, {
                    		value: "date",label: "Date"}, {
                    		value: "time",label: "Time"}, {
                    		value: "week",label: "Week"}, {
                    		value: "month",label: "Month"}, {
                    		value: "password",label: "Password"
                    	}],
                    	defaultValue: 'text',
                    	show: function ( data ) {
							return data.props && data.props.dimensionIsVariable && !data.props.variableIsDate && data.props.visualizationType=='input';
					  }
                    },
                    aboutinputs:{
						component: "text",
						label: "You can set predefined values from Variable options. Values for the variable values to be selected and keys for the labels.",
						show: function ( data ) {
							return data.props && data.props.dimensionIsVariable && data.props.visualizationType=='input';
						}
					},
                    visInputRangeSliderValuefield: {
						ref: "props.visInputRangeSliderValuefield",
						type: "boolean",
						label: "Show value next to slider?",
						show: function ( data ) {
							return data.qListObjectDef && data.props && data.props.dimensionIsVariable && data.props.visualizationType=='input' && data.props.visInputFieldType=='range';
						}
					},
                    visInputPlaceholdertxt: {
						type: "string",
						label: "Placeholder text, hint for the user",
						ref: "props.visInputPlaceholdertxt",
						defaultValue: '',
						expression:"optional",
						show: function ( data ) {
							return (data.props && data.props.dimensionIsVariable && (data.props.visualizationType=='input' || data.props.variableIsDate) && !data.props.visInputFieldType=='range')
								|| (data.props && data.props.visualizationType=='select2');
						}
					},
					htmlinputoptions:{
						type: "items",
						label: "Input options",
						show: function ( data ) {
							return data.qListObjectDef && data.props && (data.props.visualizationType=='input' && !(data.props.visInputFieldType=='text' || data.props.visInputFieldType=='color' || data.props.visInputFieldType=='password' ) || data.props.variableIsDate);
						},
						items:{
							aboutnumbers:{
								component: "text",
								label: "HTML5 number inputs are not always stabile because of the browsers... You can set min and max values for number. If you use them for date, use standard format 2017-09-25, for week 2017-W41, for month 2017-09. Step value defines step between numbers, Min and Max must be defined. Step value can be 'any' or positive floating point like '0.01' or '10'.",
								show: function ( data ) {
									return !data.props.variableIsDate;
								}
							},
							visInputNumberMin: {
								type: "string",
								label: "Min value (optional)",
								ref: "props.visInputNumberMin",
								defaultValue: '',expression:"optional"
							},
							visInputNumberMax: {
								type: "string",
								label: "Max value (optional)",
								ref: "props.visInputNumberMax",
								defaultValue: '',expression:"optional"
							},
							visInputNumberStep: {
								type: "string",
								label: "Step ('any' or positive float)",
								ref: "props.visInputNumberStep",
								defaultValue: '',expression:"optional",
								show: function ( data ) {
									return !data.props.variableIsDate;
								}
							}
						}
					},
					DropdownValueForNoSelect: {
						type: "string",
						label: "No selection -text in drop down menu, if empty nothing is shown",
						ref: "props.dropdownValueForNoSelect",
						defaultValue: 'Select',
						expression:"optional",
						show: function ( data ) {
							return data.qListObjectDef && data.props && (data.props.visualizationType=='dropdown' || data.props.visualizationType=='select2') && !data.props.selectmultiselect;
						}
					},
					selectmultiselect: {
						ref: "props.selectmultiselect",
						type: "boolean",
						label: "Allow multiple selections?",
						show: function ( data ) {
							return data.props && (data.props.visualizationType=='dropdown' || data.props.visualizationType=='select2') && !(data.props.dimensionIsVariable && !data.props.varMultiselectAllow);
						}
					},
					select2options:{
						type: "items",
						label: "Select2 options",
						show: function ( data ) {
							return data.qListObjectDef && data.props && data.props.visualizationType=='select2';
						},
						items:{
							aboutselect2:{
								component: "text",
								label: "Select2 jQuery plugin (https://select2.org) allows for example multiselect (for non-variable selections) and search"
							},
							select2allowClear: {
								ref: "props.select2allowClear",
								type: "boolean",
								label: "Show clear button?",
								defaultValue: false,
								show: function ( data ) {
									return !data.props.dimensionIsVariable;
								}
							},
							select2enableSerach: {
								ref: "props.select2enableSerach",
								type: "boolean",
								label: "Enable search?",
								defaultValue: true,
								show: function ( data ) {
									return !data.props.dimensionIsVariable && !data.props.selectmultiselect;
								}
							},
							select2hoverBGcolor: {
								type: "string",
								label: "Hover background color (red, #fff)",
								ref: "props.select2hoverBGcolor",
								defaultValue: '',expression:"optional"
							},
							select2hoverFontcolor: {
								type: "string",
								label: "Hover font color (red, #fff)",
								ref: "props.select2hoverFontcolor",
								defaultValue: '',expression:"optional"
							}
						}
					},
					/*vizactiontype: {
						
					},
					actions: {
						
					}*/
				}
			},
			settings: {
				uses: "settings",
				items: {
					sorting: {
						type: "items",
						label: "Sorting",
						show: function ( data ) {
							return data.qListObjectDef && data.props && !(data.props.dimensionIsVariable) && data.props.visualizationType != 'txtonly';
						},
						items: {
							qSortByState: {
								type: "numeric", component: "dropdown",
								label: "Sort by state",
								ref: "qListObjectDef.qDef.qSortCriterias.0.qSortByState",
								options: sortoptions,
								defaultValue: 0
							},
							qSortByNumeric: {
								type: "numeric", component: "dropdown",
								label: "Sort by numeric value",
								ref: "qListObjectDef.qDef.qSortCriterias.0.qSortByNumeric",
								options: sortoptions,
								defaultValue: 0
							},
							qSortByLoadOrder: {
								type: "numeric", component: "dropdown",
								label: "Sort by load order",
								ref: "qListObjectDef.qDef.qSortCriterias.0.qSortByLoadOrder",
								options: sortoptions,
								defaultValue: 0
								
							},
							qSortByAscii: {
								type: "numeric", component: "dropdown",
								label: "Sort by text",
								ref: "qListObjectDef.qDef.qSortCriterias.0.qSortByAscii",
								options: sortoptions,
								defaultValue: 0
								
							},
							qSortByFrequency: {
								type: "numeric", component: "dropdown",
								label: "Sort by frequency",
								ref: "qListObjectDef.qDef.qSortCriterias.0.qSortByFrequency",
								options: sortoptions,
								defaultValue: 0
								
							},
							/*qSortByExpression: {
								type: "numeric", component: "dropdown",
								label: "Sort by expression",
								ref: "qListObjectDef.qDef.qSortCriterias.0.qSortByExpression",
								options: sortoptions,
								defaultValue: 0,
								change: function(item){
									item.qListObjectDef.qDef.qSortCriterias[0].qSortByExpression = item.qListObjectDef.qDef.qSortByExpression;
								}
							},
							qExpression: {
								type: "string",
								label: "Sort by expression",
								ref: "qListObjectDef.qDef.qExpression.qv",
								defaultValue: " ",expression:"always",component: "expression",
								show: function(data) {
									if(data.qListObjectDef.qDef.qSortCriterias[0].qExpression){
										data.qListObjectDef.qDef.qExpression = data.qListObjectDef.qDef.qExpression ? data.qListObjectDef.qDef.qExpression : {qv: ''};
										data.qListObjectDef.qDef.qExpression.qv = data.qListObjectDef.qDef.qSortCriterias[0].qExpression.qv;
									}
									
									//data.qDef.qExpression = data.qDef.qExpression ? data.qDef.qExpression : {qv: ''};
									return data.qListObjectDef.qDef.qSortCriterias[0].qSortByExpression != 0;
								},
								change: function(item){
									var expr = item.qListObjectDef.qDef.qExpression.qv.qStringExpression ? item.qListObjectDef.qDef.qExpression.qv.qStringExpression.qExpr : item.qListObjectDef.qDef.qExpression.qv;
									item.qListObjectDef.qDef.qSortCriterias[0].qExpression.qv = expr.qv;
									item.qListObjectDef.qDef.qSortCriterias[0].qSortByExpression = item.qListObjectDef.qDef.qSortByExpression || 1;
								}
							}*/
						}
					},
					padandheader: padandheader,
                    Visualization: {
						type: "items",
						label: "Other visual",
						items: {
							addLeonardoUIclass:{
								ref: "props.addLUIclasses",
								type: "boolean",
								label: "Add Qlik default Leonardo UI class (works on part of the objects)",
								defaultValue: false
							},
							fontsize: {
								type: "string",
								component: "dropdown",
								label: "Font size",
								ref: "props.fontsizeChange",
								options: [
									{value: "75",label: "75%"},
									{value: "100",label: "100%"},
									{value: "125",label: "125%"}],
								defaultValue: "100"
							},
							fixedfontsize:{
								ref: "props.fixedfontsize",
								type: "boolean",
								label: "Fixed font size",
								defaultValue: false,
								show: function ( data ) { return !data.props.responsivefontsize;	}
							},
							fixedfontsizevalue: {
								type: "number",
								label: "Fixed font size value (like 12.1px)",
								ref: "props.fixedfontsizevalue",
								expression:"optional",
								defaultValue: 12,
								min: 1, max: 1000,
								show: function ( data ) { return data.props.fixedfontsize;	}
							},
							responsivefontsize:{
								ref: "props.responsivefontsize",
								type: "boolean",
								label: "Responsive font size",
								defaultValue: false
							},
							responsivefonttype: {
								type: "string",
								component: "dropdown",
								label: "Font size calculation",
								ref: "props.responsivefonttype",
								options: [
									{value: "vw",label: "% of viewport width"},
									{value: "vh",label: "% of viewport height"},
									{value: "vmin",label: "whichever is smaller"},
									{value: "vmax",label: "whichever is larger"}],
								defaultValue: "vw",
								show: function ( data ) { return data.props.responsivefontsize;	}
							},
							responsivefontvalue: {
								type: "number",
								label: "Number value (like 1.1)",
								ref: "props.responsivefontvalue",
								expression:"optional",
								defaultValue: 1.0,
								show: function ( data ) { return data.props.responsivefontsize;	}
							},
							mobileRemoveZoom: {
							  ref: "props.mobileRemoveZoom",
							  type: "boolean",
							  label: "Disable mobile zoom effect? (less clicking)",
							  defaultValue: true
							},
							removeFullScrnBtn: {
							  ref: "props.removeFullScrnBtn",
							  type: "boolean",
							  label: "Remove full screen button",
							  defaultValue: true
							},
							mobileContainerHeight: {
							  ref: "props.mobileCustomHeightCSS",
							  type: "string",
							  label: "Custom height css parameter for mobile (65px or 50%)",
							  defaultValue: ''
							},
							hlistRoundedcorners: {
							  ref: "props.hlistRoundedcorners",
							  type: "boolean",
							  label: "Rounded corners in horizontal list?",
							  defaultValue: true,
							  show: function ( data ) {
								return  data.props.visualizationType=='hlist' && !data.props.variableIsDate;
							  }
							},
							hlistMarginBetween: {
								type: "string",
								component: "dropdown",
								label: "Margin between horizontal list elements in px",
								ref: "props.hlistMarginBetween",
								options: [
									{value: "0",label: "0px"},
									{value: "1",label: "1px"},
									{value: "2",label: "2px"},
									{value: "3",label: "3px"},
									{value: "4",label: "4px"},
									{value: "5",label: "5px"},
									{value: "6",label: "6px"},
									{value: "7",label: "7px"},
									{value: "8",label: "8px"}],
								defaultValue: "1",
								show: function ( data ) {
									return data.props.visualizationType=='hlist' && !data.props.variableIsDate;
								}
							},
							hlistShowAsTable: {
							  ref: "props.hlistShowAsTable",
							  type: "boolean",
							  label: "Show as \"table \"?",
							  defaultValue: false,
							  show: function ( data ) {
								return  data.props.visualizationType=='hlist' && !data.props.variableIsDate;
							  }
							},
							displayFlexBox: {
								ref: "props.displayFlexBox",
								type: "boolean",
								label: "Show as flexbox? (fixed width elements)",
								defaultValue: false,
								show: function ( data ) {
									return  !data.props.variableIsDate;
								}
							},
							displayFlexBoxWidth: {
								ref: "props.displayFlexBoxWidth",
								type: "string",
								label: "Flex-box element width (10% or 50px or 5rem or remove default padding calc(50% - 13px))",
								defaultValue: '',expression:"optional",
								show: function(d){
									return d.props.displayFlexBox && !d.props.variableIsDate;
								}

							},
							elHeight: {
								ref: "props.elHeight",type: "string",label: "Element special height (10% or 50px or 5rem or calc(50% - 20px))",defaultValue: '',expression:"optional"
							},
							elWidth: {
								ref: "props.elWidth",type: "string",label: "Element special width",defaultValue: '',expression:"optional",
							},
							useMaxHeight: {
							  ref: "props.useMaxHeight",
							  type: "boolean",
							  label: "Use maximum height for the elements",
							  defaultValue: false,
							  show: function ( data ) {
								return !data.props.variableIsDate;
							  }
							},
							textHAlign: {
								type: "string",
								component: "dropdown",
								label: "Text horizontal align",
								ref: "props.textHAlign",
								options: [
									{value: "-",label: "default"},
									{value: "left",label: "left"},
									{value: "center",label: "center"},
									{value: "right",label: "right"}],
								defaultValue: "-"
								
							},
							textVAlign: {
								type: "string",
								component: "dropdown",
								label: "Text vertical align",
								ref: "props.textVAlign",
								options: [
									{value: "-",label: "default"},
									{value: "top",label: "top"},
									{value: "middle",label: "middle"},
									{value: "bottom",label: "bottom"}],
								defaultValue: "-"
								
							},
							removeYscroll: {
							  ref: "props.removeYscroll",
							  type: "boolean",
							  label: "Disable vertical scroll in anycase",
							  defaultValue: false
							},
							showXscroll: {
							  ref: "props.showXscroll",
							  type: "boolean",
							  label: "Show horizontal scroll (auto, hidden by default)",
							  defaultValue: false
							},
							removeLabel: {
							  ref: "props.removeLabel",
							  type: "boolean",
							  label: "Do not print labels",
							  defaultValue: false
							},
							whitespacenowrap: {
							  ref: "props.whitespacenowrap",
							  type: "boolean",
							  label: "Do not wrap white space",
							  defaultValue: false
							},
							mainobjectwidth: {
								ref: "props.mainobjectwidth",
								type: "string",
								label: "Width of the main object (use 70%, 50px)",
								defaultValue: '',
								show: function(data){
									return data.props && (data.props.visualizationType=='dropdown' || data.props.visualizationType=='select2')
								}
							},
							mouseenterWidthMult: {
								ref: "props.mouseenterWidthMult",
								label: "On mouse enter multiply width by",
								type: "number",
								expression:"optional",
								defaultValue: "1",
								min: "1"
							},
							mouseenterHeightMult: {
								ref: "props.mouseenterHeightMult",
								label: "On mouse enter multiply height by",
								type: "number",
								expression:"optional",
								defaultValue: "1",
								min: "1"
							}
						}
					},
					variableOptions:{
						type: "items",
						label: "Variable options",
						show: function ( data ) {
							return data.qListObjectDef && data.props && data.props.dimensionIsVariable;
						},
						items:{
							maxname: {
								ref: "props.maxLimitvariable",
								label: "(Depricated) Limit date selection to max from variable",
								type: "string",
								show: function ( data ) {
									return data.qListObjectDef && data.props.variableIsDate;
								},
								expression:"optional"
							},
							dateformatSelect: {
								ref: "props.dateformat",
								label: "Date format to use, match with document, use javascript format",
								type: "string",
								defaultValue: "d.m.yy",
								show: function ( data ) {
									return data.props.variableIsDate;
								},
								expression:"optional"
							},
							aboutVarOpt:{
								component: "text",
								label: "Options for values: separate by ; To use a section title use ## in the beginning. Section titles are shown in dropdowns. You can set style of section.",
								show: function ( data ) {
									return  !data.props.variableIsDate ;
								}
							},
							variableOptionsForValues: {
								ref: "props.variableOptionsForValues",
								label: "Options for values",
								type: "string",
								defaultValue: "",
								show: function ( data ) {
									return  !data.props.variableIsDate;
								},
								expression:"optional"
							},
							variableOptGroupStyle: {
								ref: "props.variableOptGroupStyle",
								label: "Style for section title",
								type: "string",
								defaultValue: "",
								show: function ( data ) {
									return  !data.props.variableIsDate && (data.props.visualizationType=='dropdown' || data.props.visualizationType=='select2');
								},
								expression:"optional"
							},
							
							varMultiselectAllow: {
								ref: "props.varMultiselectAllow",
								type: "boolean",
								label: "Allow multple value selects?",
								defaultValue: false,
								show: function ( data ) {
									return  !data.props.variableIsDate && data.props.visualizationType!='input'; //select2 single select exlude
							  }
							},
							varMultiselectSep: {
								ref: "props.varMultiselectSep",
								label: "Separate variable values with",
								type: "string",
								defaultValue: "|",
								show: function ( data ) {
									return !data.props.variableIsDate && data.props.varMultiselectAllow;
								},
								expression:"optional"
							},
							aboutSecVar:{
								component: "text",
								label: "You can set another variable to follow the main variables selections. You can use this feature like a key for the first variable",
								show: function ( data ) {
									return  !data.props.variableIsDate && data.props.visualizationType!='input';
								}
							},
							variableNameForKey: {
								ref: "props.variableNameForKey",
								label: "(Opt) Variable name for second variable",
								type: "string",
								defaultValue: "",
								show: function ( data ) {
									return  !data.props.variableIsDate  && data.props.visualizationType!='input';
								}
							},
							aboutSecondVariableOptions:{
								component: "text",
								label: "Define as many options as there are options for the main variable",
								show: function ( data ) {
									return  !data.props.variableIsDate  && (data.props.variableNameForKey || data.props.visualizationType=='input' && (data.props.visInputFieldType=='number' || data.props.visInputFieldType=='range'));
								}
							},
							variableOptionsForKeys: {
								ref: "props.variableOptionsForKeys",
								label: "Define key values, separate by ;",
								type: "string",
								defaultValue: "",
								show: function ( data ) {
									return  !data.props.variableIsDate && data.props.dimensionIsVariable && (data.props.variableNameForKey || data.props.visualizationType=='input' );
								},
								expression:"optional"
							}
						}
					},
					Selections: {
						type: "items",
						label: "Selections",
						show: function ( data ) {
							return data.qListObjectDef && data.props && !((data.props.variableIsDate || data.props.visualizationType=='input') && data.props.dimensionIsVariable)
								&& !(data.props.visualizationType=='txtonly' || data.props.visualizationType=='searchonly');
						},
						items: {
							selectDefault: {
								type: "string",
								label: "Select this one as default",
								ref: "props.allwaysOneSelectedDefault",
								defaultValue: "",
								show: function ( data ) {
									return  !(data.props.variableIsDate && data.props.dimensionIsVariable);
								},
								expression:"optional"
							},
							SelectOnyOneOption: {
							  ref: "props.selectOnlyOne",
							  type: "boolean",
							  label: "Select only one?",
							  defaultValue: false,
							  show: function ( data ) {
									return  !(data.props.dimensionIsVariable) && data.props.visualizationType!='dropdown' && data.props.visualizationType!='select2';
							  }
							},
							selectAlsoDefaults: {
								type: "string",
								label: "Select also these as default, separate by ;",
								ref: "props.selectAlsoThese",
								defaultValue: "",
								show: function ( data ) {
									return !(data.props.dimensionIsVariable || data.props.selectOnlyOne || ((data.props.visualizationType=='dropdown' || data.props.visualizationType=='select2') && !data.props.selectmultiselect) );//!(data.props.dimensionIsVariable) && !(data.props.selectOnlyOne && ((data.props.visualizationType=='dropdown' || data.props.visualizationType=='select2') && !data.props.selectmultiselect));
								},
								expression:"optional"
							},
							selectDefaultsOnlyOnce: {
							  ref: "props.selectDefaultsOnlyOnce",
							  type: "boolean",
							  label: "Select defaults only once?",
							  defaultValue: false,
							  show: function ( data ) {
									return  !(data.props.dimensionIsVariable) && data.props.visualizationType!='dropdown' && data.props.visualizationType!='select2';
							  }
							},
							clearFieldSelOnFirstLoad: {
							  ref: "props.clearFieldSelOnFirstLoad",
							  type: "boolean",
							  label: "Clear field selections on first load / refresh",
							  defaultValue: false,
							  show: function ( data ) {
									return  !(data.props.dimensionIsVariable) ;
							  }
							},
							clearFieldSelOnLeave: {
							  ref: "props.clearFieldSelOnLeave",
							  type: "boolean",
							  label: "Clear field selections on sheet leave",
							  defaultValue: false,
							  show: function ( data ) {
									return  !(data.props.dimensionIsVariable) ;
							  }
							},
							/*ForceSelections: {
								type: "string",
								label: "Force/lock these selections, separate by ;",
								ref: "props.ForceSelections",
								defaultValue: "",
								show: function ( data ) {
									return data.qListObjectDef && data.props;
								},
								expression:"optional"
							},*/
							hidePassiveItems: {
							  ref: "props.hidePassiveItems",
							  type: "boolean",
							  label: "Hide items which cannot be selected",
							  defaultValue: false,
							  show: function ( data ) {
									return !(data.props.dimensionIsVariable);
							  }
							},
							hideItems: {
								type: "string",
								label: "Hide items by value, separate by ;",
								ref: "props.hideItems",
								defaultValue: "",
								expression:"optional"
							},
							showOnlySelectedItems: {
							  ref: "props.showOnlySelectedItems",
							  type: "boolean",
							  label: "Hide items which are not selected (show only selected)",
							  defaultValue: false,
							  show: function ( data ) {
									return !(data.props.dimensionIsVariable);
							  }
							},
							showOnlySelectedItemsShowPossible: {
							  ref: "props.showOnlySelectedItemsShowPossible",
							  type: "boolean",
							  label: "- If nothing is selected, show possible",
							  defaultValue: false,
							  show: function ( data ) {
									return !(data.props.dimensionIsVariable) && data.props.showOnlySelectedItems;
							  }
							},
							rightclikcmenu:{
								ref: "props.rightclikcmenu",
								type: "boolean",
								label: "Show contextmenu (right click menu)",
								defaultValue: true,
								show: function ( data ) {
									return  !(data.props.dimensionIsVariable) 
									&& (data.props.visualizationType=='hlist' || data.props.visualizationType=='vlist' || data.props.visualizationType=='checkbox' || data.props.visualizationType=='luicheckbox' || data.props.visualizationType=='luiswitch' 
										|| ((data.props.visualizationType=='dropdown' || data.props.visualizationType=='select2') && data.props.selectmultiselect) ); //if multi select
							  	}
							},
							
							rightclickmenuoptions:{
								type: "items",
								label: "Menu options",
								show: function ( data ) {
									return  data.props.rightclikcmenu && !(data.props.dimensionIsVariable) 
									&& (data.props.visualizationType=='hlist' || data.props.visualizationType=='vlist' || data.props.visualizationType=='checkbox' || data.props.visualizationType=='luicheckbox' || data.props.visualizationType=='luiswitch'
										|| ((data.props.visualizationType=='dropdown' || data.props.visualizationType=='select2') && data.props.selectmultiselect) );
								},
								items:{
									rigthclickmenushowasicon: {
										ref: "props.rigthclickmenushowasicon",
										type: "boolean",
										label: "Show context menu as icon. If export mode is enabled this option should be enabled also because this menu cannot be shown with Qlik native context menu.",
										defaultValue: false
									},
									rightclickmenuinfo:{
										label: "About",
										type: "items",
										items: {
											aboutt:{
												component: "text", label: "Select action items for the context menu:"
											}
										}
									},
									rightclikcmenu_selall:{ref: "props.rightclikcmenu_selall", type: "boolean",label: "Select all",defaultValue: true},
									rightclikcmenu_clear:{ref: "props.rightclikcmenu_clear", type: "boolean",label: "Clear selections",defaultValue: true},
									rightclikcmenu_reverse:{ref: "props.rightclikcmenu_reverse", type: "boolean",label: "Reverse selections",defaultValue: true},
									rightclikcmenu_possible:{ref: "props.rightclikcmenu_possible", type: "boolean",label: "Select possible",defaultValue: true},
									rightclikcmenu_random:{ref: "props.rightclikcmenu_random", type: "boolean",label: "Select randomly (why? well...)",defaultValue: false},
									rightclikcmenu_defaults:{ref: "props.rightclikcmenu_defaults", type: "boolean",label: "Select default values",defaultValue: true},
									rightclikcmenu_copy:{ref: "props.rightclikcmenu_copy", type: "boolean",label: "Copy to clipboard",defaultValue: true}
								}
							}
						}
					},
					Othersettings: {
						type: "items",
						label: "Other settings",
						grouped: true,
						items: {
							HideFromSelectionsBar: {
							  ref: "props.hideFromSelectionsBar",
							  type: "boolean",
							  label: "Hide from selections bar (won't work with dimensions with functions in expression)",
							  defaultValue: false,
							  show: function ( data ) {
								return data.qListObjectDef && data.props && !data.props.dimensionIsVariable;
							  }
							},
							HideFromSelectionsFieldOptional: {
							  ref: "props.hideFromSelectionRealField",
							  type: "string",
							  label: "(Opt) Name of the field without special marks (if field has [ mark)",
							  defaultValue: "",
							  expression:"optional",
							  show: function ( data ) {
									return  (data.props.hideFromSelectionsBar);
							  }
							},
							overlay: {
								ref: "props.enableoverlay",
								type:"integer",
								label:"Show overlay (1 to enable)",
								defaultValue: 0,
								expression: 'optional'
							},
							overlaysettings: {
								type: "items",
								label: "Overlaysettings",
								show: function ( data ) {
									return data.qListObjectDef && data.props && data.props.enableoverlay;
								},
								items: {
									overlaytext: {
									  ref: "props.overlaytext",
									  type: "string",
									  label: "Overlay text",
									  defaultValue: '',
									  expression: 'optional'

									},
									overlaybgcolor: {
									  ref: "props.overlaybgcolor",
									  type: "string",
									  label: "Overlay background-color",
									  defaultValue: '#ababab',
									  expression: 'optional'
									},
									overlaytxtcss: {
									  ref: "props.overlaytxtcss",
									  type: "string",
									  label: "Overlay text CSS",
									  defaultValue: '',
									  expression: 'optional'
									},
									overlaybgcss: {
									  ref: "props.overlaybgcss",
									  type: "string",
									  label: "Overlay background CSS",
									  defaultValue: '',
									  expression: 'optional'
									}
								}
							},
							exportenabled: {
							  ref: "props.exportenabled",
							  type: "boolean",
							  label: "Enable export support (Qlik native export, if enabled right click menu not working)",
							  defaultValue: false
							}
						}
					},
					Searchsettings: {
						type: "items",
						label: "Search settings",
						show: function ( data ) {
							return 	((data.props.dimensionIsVariable && data.props.variableOptionsForValues && !data.props.variableIsDate) ||
							(data.props.visualizationType=='hlist' || data.props.visualizationType=='vlist' || data.props.visualizationType=='checkbox' || data.props.visualizationType=='radio' || data.props.visualizationType=='luicheckbox' || data.props.visualizationType=='luiswitch' || data.props.visualizationType=='searchonly')
							);
					  	},
						items: {
							enablesearch:{
								ref: "props.enablesearch",
								type: "boolean",
								label: "Enable search",
								defaultValue: true,
								show: function ( data ) {
									return data.props.visualizationType!='searchonly'
							  	}
							},
							searchExcelCopypaste: {
							  ref: "props.searchExcelCopypaste",
							  type: "boolean",
							  label: "Multiword search with Excel copy-paste",
							  defaultValue: false,
							  show: function ( data ) {
								return data.props.visualizationType!='searchonly' && data.props.enablesearch;
							  }
							},
							exportenableMultisearchWith: {
								ref: "props.exportenableMultisearchWith",
								type: "string",
								label: "Separator character for multiword search (copy-paste list of elements to search)",
								defaultValue: '',
								expression: 'optional'
							},
							searchMethod: {
								ref: "props.searchMethod",
								type: "number",
								label: "0 as qlik style, 1 as exact (fastest)",
								defaultValue: 0,
								expression: 'optional',
								show: function(data){
									return data.props.visualizationType=='searchonly';
								}
							},
							searcHideClear :{
							  ref: "props.searcHideClear",
							  type: "boolean",
							  label: "Hide clear button",
							  defaultValue: false,
							  show: function ( data ) {
								return data.props.visualizationType=='searchonly' || data.props.enablesearch;
							  }
							}
						}
					},

					Texts: {
						type: "items",
						label: "Texts",
						items: {
							inlinelabel: {
								type: "string",
								label: "Label text",
								ref: "props.inlinelabeltext",
								defaultValue: '',expression:"optional"
							},
							setlabelInline: {
								ref: "props.inlinelabelSetinline",
							  	type: "boolean",
							  	label: "Set label inline?",
							  	defaultValue: false
							},
							inlinelabelcss: {
								type: "string",
								label: "Label text CSS",
								ref: "props.inlinelabelcss",
								defaultValue: '',expression:"optional"
							},
							helptext: {
								type: "string",
								label: "Help text",
								ref: "props.helptext",
								defaultValue: '',expression:"optional"
							},
							helptextcss: {
								type: "string",
								label: "Help text CSS style",
								ref: "props.helptextcss",
								defaultValue: '',expression:"optional",
								show: function ( data ) {
									return  data.props.helptext;
							  }
							},
							hovertitle: {
								type: "string",
								label: "Text on mouse hover",
								ref: "props.hovertitletext",
								defaultValue: '',expression:"optional"
							}
						}
					},
					Colors: {
						type: "items",
						label: "Colors",
						items: {
							aboutcolors:{
								component: "text",
								label: "If field is empty, \"default\" value is used. Use CSS color codes, like #fed, blue, #123456."
							},
							transparentBackground: {
							  ref: "props.transparentBackground",
							  type: "boolean",
							  label: "Transparent background?",
							  defaultValue: false
							},
							specialBackgroundColor: {
							  ref: "props.specialBackgroundColor",
							  type: "string",
							  label: "Whole object background color (CSS color code, like #123 or red)",
							  defaultValue: '',
							  expression:"optional",
							  show: function ( data ) {
								return data.qListObjectDef && data.props && !data.props.transparentBackground;
							  }
							},
							noBorders: {
							  ref: "props.noBorders",
							  type: "boolean",
							  label: "No borders? (disabling requires reload)",
							  defaultValue: false,
							  change: function(data){
							  	if (data.props.noBorders==false){
							  		$("#sc"+data.qInfo.qId).parent().parent().parent().prev().parent().parent().css('border-width','1').parent().parent().css('border-width','1'); //restore border
							  	}
							  }
							},
							ownBordercolor: {
								ref: "props.ownBordercolor",
								label: "Border color 1 (object has two borders)",
								type: "string",
								show: function ( data ) {
									return data.qListObjectDef && data.props &&  !data.props.noBorders;
								}
							},
							ownBordercolor2: {
								ref: "props.ownBordercolor2",
								label: "Border color 2",
								type: "string",
								show: function ( data ) {
									return data.qListObjectDef && data.props &&  !data.props.noBorders;
								}
							},

							aboutcolors2:{
								component: "text",
								label: "Selection state colors. 'Possible'-state colors and fonts are used for elements which don't have different states. "
							},
							color_stateS_bg: {
								type: "string",
								label: "Selected background (Qlik green: #009845)",
								ref: "props.color_stateS_bg",
								defaultValue: '',expression:"optional"
							},
							color_stateN_bg: {
								type: "string",
								label: "Possible selection background",
								ref: "props.color_stateO_bg",
								defaultValue: '',expression:"optional"
							},
							color_stateA_bg: {
								type: "string",
								label: "Alternative selection background",
								ref: "props.color_stateA_bg",
								defaultValue: '',expression:"optional"
							},
							color_stateX_bg: {
								type: "string",
								label: "Excluded selection background",
								ref: "props.color_stateX_bg",
								defaultValue: '',expression:"optional"
							},
							fontcolors:{
								component: "text",
								label: "Font colors"
							},
							color_stateS_fo: {
								type: "string",
								label: "Selected text color",
								ref: "props.color_stateS_fo",
								defaultValue: '',expression:"optional"
							},
							color_stateN_fo: {
								type: "string",
								label: "Possible selection text color",
								ref: "props.color_stateO_fo",
								defaultValue: '',expression:"optional"
							},
							color_stateA_fo: {
								type: "string",
								label: "Alternative selection text color",
								ref: "props.color_stateA_fo",
								defaultValue: '',expression:"optional"
							},
							color_stateX_fo: {
								type: "string",
								label: "Excluded selection text color",
								ref: "props.color_stateX_fo",
								defaultValue: '',expression:"optional"
							},
							othercolors:{
								component: "text",
								label: "Other colors"
							},
							color_border: {
								type: "string",
								label: "Border color of an input",
								ref: "props.color_border",
								defaultValue: '', expression:"optional"
							},
							color_hoverBG:{
								type: "string",
								label: "Hover background color",
								ref: "props.color_hoverBG",
								defaultValue: '', expression:"optional",
								show: function ( data ) {
									return !(data.props.visualizationType=='dropdown' || data.props.visualizationType=='select2');
							  	}
							},
							color_hoverFont:{
								type: "string",
								label: "Hover font color",
								ref: "props.color_hoverFont",
								defaultValue: '', expression:"optional",
								show: function ( data ) {
									return !(data.props.visualizationType=='dropdown' || data.props.visualizationType=='select2');
							  	}
							}
						}
					},
					advancedCSS:{
						type: "items",
						label: "Advanced CSS & HTML",
						show: function ( data ) {
							return data.qListObjectDef && data.props;
						},
						items:{
							customFontCSS: {
							  ref: "props.customFontCSS",
							  type: "string",
							  label: "Custom \"font:\" css string",
							  defaultValue: '',expression:"optional"
							},
							customFontFamilyCSS: {
							  ref: "props.customFontFamilyCSS",
							  type: "string",
							  label: "Custom \"font-family:\" css string",
							  defaultValue: '',expression:"optional"
							},
							customElementAttribute: {
							  ref: "props.customElementAttribute",
							  type: "string",
							  label: "Custom HTML attribute for every element",
							  defaultValue: '',expression:"optional",
							  show: function ( data ) {
								return !(data.props.visualizationType=='dropdown' || data.props.visualizationType=='select2');
							  }
							},
							customElementClass: {
							  ref: "props.customElementClass",
							  type: "string",
							  label: "Custom HTML class for every element",
							  defaultValue: '',expression:"optional",
							  show: function ( data ) {
								return !(data.props.visualizationType=='dropdown' || data.props.visualizationType=='select2');
							  }
							},
							customStyleCSS: {
							  ref: "props.customStyleCSS",
							  type: "string",
							  label: "Custom CSS style for every element",
							  defaultValue: '',expression:"optional"
							},
							customHoverCSS: {
							  ref: "props.customHoverCSS",
							  type: "string",
							  label: "Custom hover CSS style for every element",
							  defaultValue: '',expression:"optional",
							  show: function ( data ) {
								return !(data.props.visualizationType=='dropdown' || data.props.visualizationType=='select2');
							  }
							},
							preElemHtml: {
								ref: "props.preElemHtml",
								type: "string",
								label: "HTML before every element",
								defaultValue: '',expression:"optional"
							},
							postElemHtml: {
								ref: "props.postElemHtml",
								type: "string",
								label: "HTML after every element",
								defaultValue: '',expression:"optional"
							}
						}
					}
				}
			},
			Globals: globalsettings,
			abouttxt:{
				label: "About",
				type: "items",
				items: {
					abouttxt2:{
						label: "About",
						type: "items",
						items: {
							aboutt:{
							component: "text",
							label: "Version 2.0.3 Developed by Matti Punkeri / Oivalo Oy"
							}
						}
					}
				}
			}
		}
	};
});
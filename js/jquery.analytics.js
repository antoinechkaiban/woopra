jQuery(document).ready(function() {
	
	//	Exists Function
	jQuery.fn.exists = function () { return jQuery(this).length > 0; }
	
	//	Get Days Previous
	jQuery.fn.dateprev = function (value) {
		var date = new Date();
		date.setDate(date.getDate()-value);
		text = date.getFullYear() + '-';
		m = date.getMonth() + 1;
		
		if (m < 10)
			text += '0';
		
		text += m + '-';
		d = date.getDate();
		
		if (d <10)
			text += '0';
		
		text += d;
		return text;
	}
	
	//	Variables
	var currentSuperView = null;
	var currentSubTabId = null;
	var currentSubTab = null;
	
	var pageKeys = new Array();
	var pageKeyHash = new Array();
	
	var defaultSubTab = new Array();
	var selectedSubTabs = new Array();
	
	/**
	 * Set Current Super Tab
	 * @param {Object} id
	 */
	function setCurrentSuperTab(id) {
		if (id == currentSuperView)
			return;
		
		//	Add current tab with 'current' class.
		jQuery("#woopra-super-tab-" + id).addClass("current");
		jQuery("#woopra-sub-tab-area-" + id).removeAttr("style");
		
		currentSuperView = id;
		
		//	We are going to process 'id'
		if (selectedSubTabs[id] == null) {
			setSubView(id, defaultSubTab[id]);
		}
	}
	
	/**
	 * Add Super Tab
	 * @param {Object} name
	 * @param {Object} id
	 */
	function addSuperTab(name, id) {
		
		//	Create the Tab!
		jQuery("#woopra-super-tabs").append("<li><a href='#' id='woopra-super-tab-" + id + "'>" + name + "</a></li>");
		jQuery("#woopra-analytics-box").append("<div id='woopra-sub-tab-area-" + id + "' class='woopra_analytics_inner' style='display: none;'><ul class='woopra_subtabs' id='woopra-sub-tab-ui-" + id + "'></ul><div id='woopra-viewport-" + id + "'></div></div>");
		//	Set the Action!
		jQuery("#woopra-super-tab-" + id).click(
					function() { setSuperView(id); }
				);
	}
	
	/**
	 * Add Super Sub Tab
	 * @param {Object} name
	 * @param {Object} id
	 * @param {Object} superid
	 * @param {Object} keys
	 */
	function addSubTab(name, id, superid, keys) {
		
		//	Create the Sub Tab!
		jQuery("#woopra-sub-tab-ui-" + superid).append("<li><a href='#' id='woopra-sub-tab-li-" + id + "'>" + name + "</a></li>");
		//	Set the Action!
		jQuery("#woopra-sub-tab-li-" + id).click(
				function() { setSubView(superid, id); }
			);
		
		//	Create API Key Array
		pageKeys[superid + '-' + id] = keys;
		//	Create API Key MD5 Hash
		pageKeyHash[keys[0]] = jQuery.md5(keys[0]).substr(0,4);
		
		debug("HASH KEY (" + keys[0] + "): " + pageKeyHash[keys[0]]);
		
		//	If the 'defaultSubTab' tab is null for this super id, set it to the id.
		if ( defaultSubTab[superid] == null )
			defaultSubTab[superid] = id;
		
	}
	
	/**
	 * Change Super View
	 * @param {Object} id
	 */
	function setSuperView(id) {
		
		//	If the current view is what we are at... we should not need to run?
		if (currentSuperView == id)
			return;
		
		if (currentSuperView != null) {
			//	Remove the Current Class
			jQuery('#woopra-super-tab-' + currentSuperView).removeAttr("class");
			//	Hide the Sub Tabs For this Area
			jQuery('#woopra-sub-tab-area-' + currentSuperView).attr("style", "display: none;");
			//	Clear All 'class' information from all 'li' inside 'woopra-sub-tab-area'
			jQuery('#woopra-sub-tab-area-' + currentSuperView + ' li').each(function(i) {
					jQuery(this).removeAttr("class");
				}
			);
		}
		
		//	Set the new class!
		jQuery("#woopra-super-tab-" + id).addClass("current");
		jQuery("#woopra-sub-tab-area-" + id).removeAttr("style");
		
		//	Set the current supre view to the current 'id'
		currentSuperView = id;
		
		//	Set the Sub View
		if (selectedSubTabs[id] == null)
			setSubView(id, defaultSubTab[id]);
		else
			setSubView(id, selectedSubTabs[id]);
		
		return false;
	}
	
	/**
	 * Set Sub View
	 * @param {Object} superid
	 * @param {Object} id
	 */
	function setSubView(superid, id) {
		
		//	Set the Current Sub Tab ID
		currentSubTabId = selectedSubTabs[superid];
		
		//	If the user is clicking on me again, we should just refresh the data.
		if (currentSubTabId == id) {
			showWoopraAnalytics(superid, id);	
			return false;
		}
		
		if (currentSubTabId != null) {
			//	Remove the class.
			jQuery('#woopra-sub-tab-li-' + currentSubTabId).removeAttr("class");
		}
		
		//	Selected Sub Tabs
		selectedSubTabs[superid] = id;
		
		//	Add class 'current'
		jQuery("#woopra-sub-tab-area-" + superid).removeAttr("style");	// doesn't matter if this is running right now.
		jQuery("#woopra-sub-tab-li-" + id).addClass("current");
		
		showWoopraAnalytics(superid, id);
		return false;
		
	}
	
	/**
	 * Show the Analytics!
	 * @param {Object} superid
	 * @param {Object} id
	 */
	function showWoopraAnalytics(superid, id) {
		
		//	Make it a block!
		jQuery('#woopra-viewport-' + superid).attr("style", "display: block;");
		
		if ( !jQuery('#woopra-data-' + superid + '-' + id).exists() ) {
			//	Create elements!
			jQuery('#woopra-viewport-' + superid).append("<div></div>");
			//	Set the 'div' to id "#superid-id"
			jQuery('#woopra-viewport-' + superid + ' div').attr("id", "woopra-data-" + superid + "-" + id);
		}
		
		//	Put the 'Loading Image Up'
		jQuery('#woopra-data-' + superid + '-' + id).html('<p align="center"><img src="' + woopraL10n.baseurl + '/images/woopra-loader.gif" alt="' + woopraL10n.loading + '" /><br/>' + woopraL10n.loading + '</p>');
		
		//	Request the Data
		requestData(superid + '-' + id, pageKeys[superid + '-' + id]);
	}
	
	/**
	 * Request the Data From the API. Calls admin-ajax.php which will process allow xml.php
	 * to query the database correctly.
	 * 
	 * area - ID name that will show all the data.
	 * key - Array holding possiable three bits of information. 
	 * 			* apipage - The page that we are querying.
	 * 			* type (For getReferrers Method)
	 * 			* aggregate_by ()
	 * @param {Object} area
	 * @param {Object} key
	 */
	function requestData(area, key) {
		
		//	Get the data requested!
		jQuery.get(
			woopraL10n.siteurl + '/wp-admin/admin-ajax.php',	//	The admin ajax file
			{
				//	Stuff needed for WordPress. Not part of the Query API Call
				action: "woopra",
				datatype: "regular",
				//	Part of the Woopra API Call
				apipage: key[0],
				apikey: woopraL10n.apikey,
				date_format: woopraL10n.dateformat,
				from: jQuery('#woopra-from').val(),
				to: jQuery('#woopra-to').val(),
				//	Special Queries
				type: (key[1]) ? key[1] : '',
				aggregate_by: (key[2]) ? key[2] : ''
			},
			function(returned_data) {
				if (returned_data != null) {
					//	Return the data..
					jQuery('#woopra-data-' + area).html(returned_data);
				} else {
					jQuery('#woopra-data-' + area).html(woopraL10n.error);
				}
			}
		);
		
	}
	
	/**
	 * Debug
	 * @param {Object} message
	 */
	function debug(message) {
		if (typeof console != 'undefined' && typeof console.debug != 'undefined') {
			console.debug(message);
		}
	}
	
	/** Non "Global" Functions **/
	
	//	Show Date Picker
	jQuery("#woopra-daterange").click(function() {
		jQuery("#woopra-datepickerdiv").toggle();
	});
	
	//	Refresh the date!
	jQuery("#woopra-refreshdate").click(function() {
		refreshCurrent();
	});	
	
	//	Close Date Picker!
	jQuery("#woopra-closepicker").click(function() {
		jQuery("#woopra-datepickerdiv").toggle();
	});
	
	//	Apply Date Range
	jQuery("#woopra-applydaterange").click(function() {
		
		//	Set values!
		jQuery("#woopra-from").attr('value', jQuery("#woopra-from").val());
		jQuery("#woopra-to").attr('value', jQuery("#woopra-to").val());
		
		//	Refresh Link Text!
		refreshDateLinkText();
		
		//	Refresh Current Data!
		refreshCurrent();
		
		//	Hide the Date Picker!
		jQuery("#woopra-datepickerdiv").toggle();
		
	});
	
	function refreshCurrent() {
		//	Set the current view! This double makes sure everything is visable.
		setSuperView(currentSuperView);
		setSubView(currentSuperView, selectedSubTabs[currentSuperView]);
	}

	//	Set the link for the date-range selector <a>
	function refreshDateLinkText() {
		jQuery("#woopra-daterange").html('<strong>' + woopraL10n.from + '</strong>: ' + jQuery("#woopra-from").val() + ' - <strong>' + woopraL10n.to + '</strong>: ' + jQuery("#woopra-to").val());
	}
	
	//	Set the 'from' and 'to' date.
	jQuery("#woopra-from").attr('value', jQuery(this).dateprev(30) ).datepicker({ dateFormat: 'yy-mm-dd' });
	jQuery("#woopra-to").attr('value', jQuery(this).dateprev(0) ).datepicker({ dateFormat: 'yy-mm-dd' });
	
	//	Run!	
	refreshDateLinkText();
		
	//	Create Super Tabs
	addSuperTab( woopraL10n.visitors,		'visitors');
	addSuperTab( woopraL10n.systems,		'systems');
	addSuperTab( woopraL10n.pages,			'pages');
	addSuperTab( woopraL10n.referrers,		'referrers');
	addSuperTab( woopraL10n.searches,		'searches');
	//addSuperTab( woopraL10n.tagvisitors,	'tagvisitors');
	
	//	Create Visitors Sub Tabs
	addSubTab( woopraL10n.overview,		'overview',		'visitors',		new Array('getGlobals') );
	addSubTab( woopraL10n.countries,	'countries',	'visitors',		new Array('getCountries') );
	addSubTab( woopraL10n.bouncerate,	'bounces',		'visitors',		new Array('getVisitBounces') );
	addSubTab( woopraL10n.visitdura,	'durations',	'visitors',		new Array('getVisitDurations') );
	
	//	Create Systems Sub Tabs
	addSubTab( woopraL10n.browsers,		'browsers',		'systems',		new Array('getBrowsers') );
	addSubTab( woopraL10n.platforms,	'platforms',	'systems',		new Array('getPlatforms') );
	addSubTab( woopraL10n.screenres,	'resolutions',	'systems',		new Array('getResolutions') );
	addSubTab( woopraL10n.languages,	'languages',	'systems',		new Array('getLanguages') );
	
	//	Create Pages Sub Tabs
	addSubTab( woopraL10n.pageview, 	'pageviews',	'pages',		new Array('getPageviews') );
	addSubTab( woopraL10n.landingpage,	'landing',		'pages',		new Array('getPageLandings') );
	addSubTab( woopraL10n.exitpage,		'exit',			'pages',		new Array('getPageExits') );
	addSubTab( woopraL10n.outgoinglink,	'outgoing',		'pages',		new Array('getOutgoingLinks') );
	addSubTab( woopraL10n.downloads,	'downloads',	'pages', 		new Array('getDownloads') );
	
	//	Create Referrer Sub Tabs
	addSubTab( woopraL10n.referrer_ty,	'reftypes',		'referrers', 	new Array('getReferrerTypes') );
	addSubTab( woopraL10n.referrer_se,	'refsearch',	'referrers',	new Array('getReferrers', 'search') );
	addSubTab( woopraL10n.referrer_fr,	'reffeeds',		'referrers',	new Array('getReferrers', 'feeds') );
	addSubTab( woopraL10n.referrer_em,	'refmails', 	'referrers',	new Array('getReferrers', 'email') );
	addSubTab( woopraL10n.referrer_sb,	'refbookmarks', 'referrers',	new Array('getReferrers', 'socialbookmarks') );
	addSubTab( woopraL10n.referrer_sn,	'refnetworks',	'referrers',	new Array('getReferrers', 'socialnetwork') );
	addSubTab( woopraL10n.referrer_me,	'refmedia',		'referrers',	new Array('getReferrers', 'media') );
	addSubTab( woopraL10n.referrer_ne,	'refnews',		'referrers',	new Array('getReferrers', 'news') );
	addSubTab( woopraL10n.referrer_co,	'refcomm',		'referrers',	new Array('getReferrers', 'community') );
	addSubTab( woopraL10n.referrer_al,	'reflinks',		'referrers',	new Array('getReferrers', 'alllinks') );
	
	//	Create Searches Sub Tab
	addSubTab( woopraL10n.search_quer,	'queries',		'searches',		new Array('getQueries') );
	addSubTab( woopraL10n.keywords,		'keywords',		'searches',		new Array('getKeywords') );
	
	//	By Default Set The Current View
	//	@todo Make this confirgurable!
	setCurrentSuperTab('visitors');
	
});

/**
 * Expand Line Chart for Rendering the Flash Chart
 * @param {Object} id
 */
function expandLineChart(id) {
	
	var apipage = jQuery('#woopra-chart-data-apipage').val();
	var hashid = jQuery('#woopra-chart-data-hashid').val();
	var date_format = jQuery('#woopra-chart-data-dateformat').val();
	var date_from = jQuery('#woopra-chart-data-startday').val();
	var date_to = jQuery('#woopra-chart-data-endday').val();
	
	var type;
	
	/* Only needed if this is a refer area */
	if ( apipage == "getReferrers" )
		type = jQuery('#woopra-chart-data-type').val();
	
	if ( jQuery('#woopra-chart-line-tr-' + hashid + '-' + id).attr('class') == 'loaded' )
	{
		// Hide the 'tr'
		jQuery('#woopra-chart-line-tr-' + hashid + '-' + id).attr("style", "display: none;").removeAttr("class");
		// Clear the flash element. So it can be reloaded at a future time.
		jQuery('#woopra-chart-line-td-' + hashid + '-' + id).html();
		// Return False
		return false;
	}
	
	//	Show Chart Line 'tr'
	jQuery('#woopra-chart-line-tr-' + hashid + '-' + id).attr("style", "display: table-row;").addClass("loaded");
	
	var phpFile = woopraL10n.siteurl + '/wp-admin/admin-ajax.php?action=woopra&datatype=flash&apikey=' + woopraL10n.apikey + '&type=' + type + '&date_format=' + date_format + '&from=' + date_from + '&to=' + date_to;
	//	Show the Flash Chart!
	jQuery('#woopra-chart-line-td-' + hashid + '-' + id).flash({
		src : woopraL10n.baseurl + '/flash/open-flash-chart.swf',
		'data-file' : escape(phpFile),
		width : '968',
		height : '110',
		quality : 'best',
		bgcolor : '#FFFFFF',
		allowFullScreen : 'false',
		menu : 'false',
		allowScriptAccess : 'sameDomain',
		expressInstall : true
	}, {
		version: 10
	},
	function (htmlOptions) {
		jQuery(this).html(jQuery.fn.flash.transform(htmlOptions));
	});
	
	return false;
}
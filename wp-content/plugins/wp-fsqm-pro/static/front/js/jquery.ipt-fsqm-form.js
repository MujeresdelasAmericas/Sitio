/**
 * The main plugin for FSQM Forms
 *
 * This is fired after Plugin UIF INIT
 */

(function($) {
	var methods = {
		init : function() {
			return $(this).each(function() {
				var _self = this;
				var primary_css = {
					id : 'ipt_fsqm_primary_css',
					src : iptFSQM.location + 'css/form.css?version=' + iptFSQM.version
				},
				waypoint_animation = $(this).data('animation') == 1 ? true: false;
				$(this).iptPluginUIFFront({
					callback : function() {
						methods.applyFSQM.apply(_self);
					},
					additionalThemes : [primary_css],
					waypoints: waypoint_animation
				});
			});
		},
		timerTabFormSync : {
			timerEnabled: false,
			forceProgress: false,
			forceSubmit: false
		},
		applyFSQM : function() {
			//methods.applyValidation.apply(this);
			methods.applyTimerEvent.apply(this);
			methods.applyTabEvents.apply(this);
			methods.applyFormEvents.apply(this);
			methods.applyNonceEvents.apply(this);
		},
		applyNonceEvents: function() {
			var container = $(this);
			// Do nothing if no form_id
			if ( ! container.find('input[name="form_id"]').length ) {
				return;
			}

			var form_id = container.find('input[name="form_id"]').val(),
			dataIDField = container.find('input[name="data_id"]'),
			data_id = dataIDField.length ? dataIDField.val() : null,
			nonceSaveField = container.find('input[name="ipt_fsqm_form_data_save"]'),
			nonceUpdateField = container.find('input[name="ipt_fsqm_user_edit_nonce"]'),
			userEditField = container.find('input[name="user_edit"]'),
			ajaxData = {
				form_id: form_id,
				action: 'ipt_fsqm_refresh_nonce'
			};

			if ( data_id !== null ) {
				ajaxData.data_id = data_id;
			}

			if ( userEditField.length ) {
				ajaxData.user_edit = '1';
			}

			// Refresh the nonce
			var refreshNonce = function() {
				$.post(iptFSQM.ajaxurl, ajaxData, function(data, textStatus, xhr) {
					if ( typeof( data ) == 'object' && data.success === true ) {
						nonceSaveField.val(data.save_nonce);
						if ( nonceUpdateField.length ) {
							nonceUpdateField.val(data.edit_nonce);
						}
					}
				});
			};
			refreshNonce();
			var nonceInterval = setInterval(refreshNonce, 3600000);
			container.data('iptFSQMNonceInterval', nonceInterval);
		},
		applyFormEvents : function() {
			var container = $(this);
			container.find('form.ipt_uif_validate_form').on('submit', function(e) {
				e.preventDefault();
				var _self_form = this;

				//Prevent submission if not from last tab
				var main_tab = container.find('.ipt_fsqm_main_tab');
				if(main_tab.length) {
					var tabIndices = main_tab.find('> ul.ui-tabs-nav > li'),
					selected_tab = tabIndices.index(tabIndices.filter('[tabindex="0"]'));
					if ( selected_tab != tabIndices.length -1 && (  container.data('timerTabFormSync').timerEnabled != true || container.data('timerTabFormSync').forceSubmit != true ) ) {
						//Change the tab
						main_tab.tabs('option', 'active', selected_tab + 1);
						return;
					}
				}

				//Make sure there is no collapsed required element
				methods.openRequiredCollapsedElements.apply(this, [container]);

				// Prevent submission if not validates
				// but ignore validation anyway if timer says so
				if ( container.data('timerTabFormSync').timerEnabled != true || container.data('timerTabFormSync').forceSubmit != true ) {
					if( $(this).validationEngine('validate') === false ) {
						return;
					}
					// Check to see any active upload + required upload
					var pass_upload = methods.checkUploadRequests.apply( this, [$(_self_form)] );
					if ( pass_upload === false ) {
						return;
					}
				}



				//Do the ajax submission
				//Get all the necessary variables
				var process = container.find('.ipt_fsqm_form_message_process'),
				success = container.find('.ipt_fsqm_form_message_success'),
				http_error = container.find('.ipt_fsqm_form_message_error'),
				form_wrap = container.find('.ipt_uif_hidden_init');

				//Hide the form_wrap
				form_wrap.hide();
				success.hide();
				http_error.hide();

				//Show the process
				process.show();
				var process_ajax = process.find('.ipt_uif_ajax_loader_inline').css('width', 'auto'),
				init_width = process.width(),
				process_width = process_ajax.width() + 50,
				process_height = process_ajax.height();

				process_ajax.css({width: init_width, height: process_height, opacity: 0}).animate({width: process_width, opacity: 1}, 'normal', function() {
					//Post the data
					var data = {
						action: $(_self_form).find('[name="action"]').val(),
						ipt_ps_post: $(_self_form).serialize(),
						ipt_ps_send_as_str: true,
						ipt_ps_look_into: 'ipt_ps_post'
					};
					$.post(iptFSQM.ajaxurl, data, function(response) {
						if(response == null) {
							http_error.find('.textStatus').html('Null Data');
							http_error.find('.errorThrown').html('Possible Server Error');
							http_error.slideDown('fast');
							//Show the form
							form_wrap.show();
							//Scroll to the http_error
							methods.scrollToPosition(http_error.offset().top - 10);
							return;
						}

						if(response.success == true) {
							success.find('.ui-widget-content').html(response.msg);
							success.slideDown('fast', function() {
								//Scroll to success
								methods.scrollToPosition(success.offset().top - 10);

								//Redirect if necessary
								if(response.components.redirect == true) {
									setTimeout(function() {
										if ( window.self === window.top || ! response.components.redirect_top ) {
											window.location.href = response.components.redirect_url;
										} else {
											window.top.location.href = response.components.redirect_url;
										}
									}, response.components.redirect_delay);
								}
							});
							clearInterval( container.data('iptFSQMNonceInterval') );
						} else {
							form_wrap.show();
							if(undefined !== response.errors && typeof(response.errors) == 'object') {
								var errors = response.errors;
								for(var i = 0; i < errors.length; i++) {
									var msgs = errors[i]['msgs'].join('<br />');
									if(errors[i]['id'] != '') {
										var error_to = $('#' + errors[i]['id']);
										if(error_to.length) {
											error_to.validationEngine('showPrompt', msgs, 'red', 'topLeft');
										} else {
											form_wrap.validationEngine('showPrompt', msgs, 'red', 'topLeft');
										}
									} else {
										form_wrap.validationEngine('showPrompt', msgs, 'red', 'topLeft');
									}
								}
								alert( iptFSQM.l10n.validation_on_submit );
							}
							methods.scrollToPosition(form_wrap.offset().top - 10);
						}
					}, 'json').fail(function(jqXHR, textStatus, errorThrown) {
						//Show the form
						form_wrap.show();
						//Show the http_error
						http_error.find('.textStatus').html(textStatus);
						http_error.find('.errorThrown').html(errorThrown);
						http_error.show();
						//Scroll to the http_error
						methods.scrollToPosition(http_error.offset().top - 10);
					}).always(function() {
						//Hide the process
						process.hide();
					});
				});
				//Scroll to the process
				methods.scrollToPosition(process.offset().top - 10, 0);
			});
		},
		applyTabEvents : function() {
			var main_tab = $(this).find('.ipt_fsqm_main_tab');
			var form = $(this).find('form.ipt_uif_validate_form');
			var main_pb = $(this).find('.ipt_fsqm_main_pb');
			if (!main_tab.length) {
				return;
			}

			var tab_settings = main_tab.data('settings'),
			container = this,
			next_button = $(this).find('.ipt_fsqm_form_button_next'),
			previous_button = $(this).find('.ipt_fsqm_form_button_prev');

			//Hide the Uls for progressbar
			if(tab_settings.type == 2) {
				main_tab.find('> ul.ui-tabs-nav').hide();
			}

			// Hide the previous button if needed
			// https://iptlabz.com/ipanelthemes/wp-fsqm-pro/issues/6
			if ( tab_settings['block-previous'] == true ) {
				previous_button.hide();
			}

			//Do the common stuff
			//Get all the li for indexing
			var tabIndices = main_tab.find('> ul.ui-tabs-nav > li');
			//Init the buttons
			methods.initButtonsForTabs.apply(container, [tabIndices, main_tab, tab_settings]);
			main_tab.on('tabsbeforeactivate', function(event, ui) {
				//Get the current tab index
				var indexOld = tabIndices.index(ui.oldTab),
				indexNew = tabIndices.index(ui.newTab);

				// Always block if moving away from multiple forward
				// Rather trigger a click on the next button
				if(indexNew > indexOld && Math.abs(indexOld - indexNew) > 1) {
					// But only if it hasn't skipped the hidden tabs
					// https://iptlabz.com/ipanelthemes/wp-fsqm-pro/issues/51
					var skipCheck = true;
					for ( var i = indexOld + 1; i < indexNew; i++ ) {
						if ( tabIndices.eq(i).is(':visible') ) {
							skipCheck = false;
							break;
						}
					}
					if ( skipCheck == false ) {
						if(!next_button.button('option', 'disabled')) {
							next_button.trigger('click');
						}
						return false;
					}
				}

				// Check for moving backward
				if(indexNew < indexOld) {
					//If settings permit
					//https://iptlabz.com/ipanelthemes/wp-fsqm-pro/issues/6
					if ( tab_settings['block-previous'] == true ) {
						return false;
					}
					// If can previous without validation
					if(tab_settings['can-previous'] == true) {
						// Also check for any possible skips
						if ( methods.skipTabIfNecessary( ui, indexNew, indexOld, tabIndices, main_tab ) ) {
							return false;
						}

						methods.scrollToTab(main_tab, tab_settings);
						return true;
					}
				}

				// Now just move if a timer event is triggered
				if ( $(container).data('timerTabFormSync').forceProgress == true && $(container).data('timerTabFormSync').timerEnabled == true ) {
					// There is a possibility that the new tab is conditionally hidden
					// https://iptlabz.com/ipanelthemes/wp-fsqm-pro/issues/51
					if ( methods.skipTabIfNecessary( ui, indexNew, indexOld, tabIndices, main_tab ) ) {
						return false;
					} else {
						return true;
					}
					$(container).data('timerTabFormSync').forceProgress = false;
				}

				//Make sure there is no collapsed required element
				methods.openRequiredCollapsedElements.apply(this, [ui.oldPanel]);

				//Else validate the current panel
				var check_me = ui.oldPanel.find('.check_me');
				for(var item = 0; item < check_me.length; item++) {
					var jItem = check_me.eq(item);
					if(true == jItem.validationEngine('validate')) {
						//Scroll to its position
						var scrollTo = jItem.offset().top - 80;
						methods.scrollToPosition(scrollTo);
						return false;
					}
				}

				// Now check any upload requests
				// Check to see any active upload + required upload
				var pass_upload = methods.checkUploadRequests.apply( this, [ui.oldPanel] );
				if ( pass_upload === false ) {
					return false;
				}

				// There is a possibility that the new tab is conditionally hidden
				// https://iptlabz.com/ipanelthemes/wp-fsqm-pro/issues/51
				if ( methods.skipTabIfNecessary( ui, indexNew, indexOld, tabIndices, main_tab ) ) {
					return false;
				}

				methods.scrollToTab(main_tab, tab_settings);
				return true;
			});
			main_tab.on('tabsactivate', function(event, ui) {
				if(tab_settings.type == 2 && tab_settings['show-progress-bar'] === true) {
					var indexNew = tabIndices.index(ui.newTab),
					percentage = Math.round(10000 * indexNew / tabIndices.length) / 100;
					main_pb.progressbar('option', 'value', percentage);
				}

				methods.refreshButtonsForTabs.apply(container, [tabIndices, ui.newTab]);
			});
		},

		applyTimerEvent: function() {
			$(this).data( 'timerTabFormSync', {
				timerEnabled: false,
				forceProgress: false,
				forceSubmit: false
			} );
			var that = $(this),
			form_id = that.find('input[name="form_id"]').val(),
			timerVar = $.parseJSON( that.find('.ipt_fsqm_timer_data').val() ),
			timerOuterDIV = that.find('.ipt_fsqm_timer'),
			timerDIV = timerOuterDIV.find('> .ipt_fsqm_timer_inner'),
			button_container = that.find('.ipt_fsqm_form_button_container'),
			prev_button = button_container.find('.ipt_fsqm_form_button_prev'),
			next_button = button_container.find('.ipt_fsqm_form_button_next'),
			submit_button = button_container.find('.ipt_fsqm_form_button_submit'),
			destroyTimer = function() {
				timerDIV.hide().parent().hide().next('.ipt_fsqm_timer_spacer').hide();
				that.data('timerTabFormSync').timerEnabled = false;
				that.data('timerTabFormSync').forceProgress = false;
				that.data('timerTabFormSync').forceSubmit = false;
			},
			reInitTimer = function() {
				timerDIV.show().parent().show().next('.ipt_fsqm_timer_spacer').show();
				that.data('timerTabFormSync').timerEnabled = true;
			},
			progressTimerPage = function() {
				if ( next_button.button('option', 'disabled') || timerVar.type == 'overall' ) {
					// Submit
					that.data('timerTabFormSync').forceProgress = false;
					that.data('timerTabFormSync').forceSubmit = true;
					var forceSubmit = false;
					if ( submit_button.button( 'option', 'disabled' ) ) {
						submit_button.button( 'option', 'disabled', false );
						forceSubmit = true;
					}
					submit_button.button( 'option', 'disabled', false ).trigger('click');
					if ( forceSubmit ) {
						submit_button.button( 'option', 'disabled', true );
					}
					destroyTimer();
				} else {
					// Progress
					that.data('timerTabFormSync').forceProgress = true;
					that.data('timerTabFormSync').forceSubmit = false;
					next_button.trigger('click');
				}
			};
			if ( null == timerVar || ! timerVar ) {
				return;
			}
			that.data('timerTabFormSync').timerEnabled = true;
			that.data('timerTabFormSync').timerVar = timerVar;
			if ( timerVar.type == 'overall' ) {
				if ( timerVar.time == 0 || timerVar.time == '' || isNaN( timerVar.time ) ) {
					destroyTimer();
				} else {
					timerDIV.data('timer', timerVar.time);
					timerDIV.TimeCircles({
						time: {
							Days: {show: false}
						},
						total_duration: 'Auto',
						count_past_zero: false
					}).addListener(function(unit, value, total) {
						if ( total === 0 ) {
							progressTimerPage();
						}
					});
				}
			} else if ( timerVar.type == 'page_specific' ) {
				timerDIV.TimeCircles()
				var main_tab = that.find('.ipt_fsqm_main_tab'),
				totalTime = 0;
				for ( var i in timerVar.time ) {
					var pageTime = parseFloat( timerVar.time[i] );
					if ( isNaN(  pageTime) ) {
						pageTime = 0;
					}
					$('#ipt_fsqm_form_' + form_id + '_tab_' + i).data('ipt_fsqm_timer', pageTime);
					totalTime += pageTime;
				}
				if ( ! main_tab.length ) {
					// Just use the totalTime to submit the form
					if ( totalTime == 0 || totalTime == '' || isNaN( totalTime ) ) {
						destroyTimer();
					} else {
						timerDIV.TimeCircles().destroy();
						timerDIV.data('timer', totalTime);
						timerDIV.TimeCircles({
							time: {
								Days: {show: false}
							},
							total_duration: 'Auto',
							count_past_zero: false
						}).addListener(function(unit, value, total) {
							if ( total === 0 ) {
								progressTimerPage();
							}
						});
					}
				} else {
					// Modify the tab settings beforehand
					var tab_settings = main_tab.data('settings');
					tab_settings['block-previous'] = true;
					main_tab.data('settings', tab_settings);
					var applyActiveTabTimer = function() {
						var activeTab = main_tab.find('.ui-tabs-panel').eq( main_tab.tabs( 'option', 'active' ) ),
						tabTimer = parseFloat( activeTab.data('ipt_fsqm_timer') );
						timerDIV.TimeCircles().destroy();
						if ( tabTimer == 0 || isNaN( tabTimer ) ) {
							destroyTimer();
						} else {
							reInitTimer();
							timerDIV.data('timer', tabTimer);
							timerDIV.TimeCircles({
								time: {
									Days: {show: false}
								},
								total_duration: 'Auto',
								count_past_zero: false
							}).addListener(function(unit, value, total) {
								if ( total === 0 ) {
									progressTimerPage();
								}
							});
						}
					};

					applyActiveTabTimer();

					main_tab.on('tabsactivate', applyActiveTabTimer);
				}
			} else {
				destroyTimer();
			}

			// Attach the scroll event
			if ( timerVar.type == 'overall' || timerVar.type == 'page_specific' ) {
				var affixTimerScroll = function() {
					var windowTop = $(window).scrollTop(),
					windowBottom = windowTop + $(window).height(),
					containerOffset = that.offset(),
					containerTop = containerOffset.top + 10,
					containerBottom = containerTop + that.outerHeight() + 90;

					if ( ( windowBottom >= containerTop ) && ( containerBottom >= windowBottom ) ) {
						if ( ! timerOuterDIV.hasClass('fixed') ) {
							timerOuterDIV.addClass('fixed');
							timerDIV.TimeCircles().rebuild();
						}
					} else {
						if ( timerOuterDIV.hasClass('fixed') ) {
							timerOuterDIV.removeClass('fixed');
							timerDIV.TimeCircles().rebuild();
						}
					}
				};

				$(document).on( 'scroll', affixTimerScroll );

				affixTimerScroll();

				$(window).on('resize iptUIFCShow iptUIFCHide tabsactivate', function() {
					affixTimerScroll();
					timerDIV.TimeCircles().rebuild();
				});
			}
		},

		skipTabIfNecessary: function( ui, indexNew, indexOld, tabIndices, main_tab ) {
			if ( ui.newTab.hasClass('iptUIFCHidden') ) {
				var visibleTab = null;
				// If it's a move left request
				if ( indexNew < indexOld ) {
					// Get the nearest visible tab
					visibleTab = ui.newTab.prev('li');
					while ( visibleTab.hasClass('iptUIFCHidden') ) {
						visibleTab = visibleTab.prev('li');

						if ( ! visibleTab.length ) {
							break;
						}
					}
				// If it is a move right request
				} else {
					visibleTab = ui.newTab.next('li');
					while ( visibleTab.hasClass('iptUIFCHidden') ) {
						visibleTab = visibleTab.next('li');

						if ( ! visibleTab.length ) {
							break;
						}
					}
				}

				var newTab = tabIndices.index( visibleTab );

				if ( newTab != -1 ) {
					main_tab.tabs('option', 'active', newTab);
				}
				return true;
			}
			return false;
		},

		checkUploadRequests : function( activeContainer ) {
			var passed_validation = true;
			activeContainer.find( '.ipt_uif_uploader' ).each( function() {
				if ( ! $(this).is(':visible') ) {
					return true;
				}
				var widget = $(this),
				activeUpload = widget.data( 'activeUpload' ),
				totalUpload = widget.data( 'totalUpload' ),
				uploadSettings = widget.data( 'settings' );

				// Check for active uploads
				if ( activeUpload > 0 ) {
					widget.validationEngine('showPrompt', iptFSQM.l10n.uploader_active_upload, 'red', 'topLeft');
					passed_validation = false;
				}

				// Check for required uploads
				if ( uploadSettings.required === true && totalUpload < 1 ) {
					widget.validationEngine('showPrompt', iptFSQM.l10n.uploader_required, 'red', 'topLeft');
					passed_validation = false;
				}

				// Check for min number of files
				var min_number_of_files = parseInt( uploadSettings.min_number_of_files, 10 );
				if ( isNaN( min_number_of_files ) || min_number_of_files < 0 ) {
					min_number_of_files = 0;
				}
				if ( min_number_of_files > 1 && totalUpload < min_number_of_files ) {
					widget.validationEngine('showPrompt', iptFSQM.l10n.uploader_required_number + ' ' + min_number_of_files, 'red', 'topLeft');
					passed_validation = false;
				}

				if ( passed_validation === false ) {
					// Scroll to required position
					var scroll_to = widget.offset().top - 10;
					methods.scrollToPosition( scroll_to );
					return false;
				}
			} );

			return passed_validation;
		},
		openRequiredCollapsedElements : function(container) {
			//Find all collapsible elements and if it has a required anything,
			//then open it
			container.find('.ipt_uif_collapsible').each(function() {
				var openIt = false;
				$(this).find('.check_me').each(function() {
					if($(this).attr('class').match(/required/)) {
						openIt = true;
						return false;
					}
				});
				if(openIt && !$(this).hasClass('ipt_uif_collapsible_open')) {
					$(this).find('>.ipt_uif_container_head > h3 > a').trigger('click');
				}
			});
		},
		initButtonsForTabs : function(tabIndices, main_tab, tab_settings) {
			var button_container = $(this).find('.ipt_fsqm_form_button_container'),
			prev_button = button_container.find('.ipt_fsqm_form_button_prev'),
			next_button = button_container.find('.ipt_fsqm_form_button_next'),
			submit_button = button_container.find('.ipt_fsqm_form_button_submit'),
			terms_wrap = button_container.prev('.ipt_fsqm_terms_wrap');
			if(tabIndices.length == 1) { //Remove if unnecessary
				prev_button.remove();
				next_button.remove();
				submit_button.button('enable');
			} else { //Init them
				prev_button.button('disable');
				submit_button.button('disable');
				next_button.button('enable');
				terms_wrap.hide();

				prev_button.on('click', function(e) {
					e.preventDefault();
					var newTab = tabIndices.index(tabIndices.filter('[aria-selected="true"]').prev('li'));
					if(newTab != -1) {
						main_tab.tabs('option', 'active', newTab);
					}
				});
				next_button.on('click', function(e) {
					e.preventDefault();
					var newTab = tabIndices.index(tabIndices.filter('[aria-selected="true"]').next('li'));
					if(newTab != -1) {
						main_tab.tabs('option', 'active', newTab);
					}
				});
			}
		},
		scrollToTab : function(main_tab, tab_settings) {
			if ( tab_settings.scroll == false ) {
				return;
			}
			var scrollTo = main_tab.offset().top - 10 + tab_settings.scroll_offset;
			if(tab_settings.type == 2 && tab_settings['show-progress-bar'] == true) {
				scrollTo = main_tab.prev('.ipt_uif_progress_bar').offset().top - 10 + tab_settings.scroll_offset;
			}
			methods.scrollToPosition(scrollTo);
		},
		scrollToPosition : function(scrollTo, duration) {
			if(duration == undefined) {
				duration = 200;
			}
			var htmlTop = parseFloat($('html').css('margin-top'));
			if(isNaN(htmlTop)) {
				htmlTop = 0;
			}
			htmlTop += parseFloat($('html').css('padding-top'));
			if(!isNaN(htmlTop) && htmlTop != 0) {
				scrollTo -= htmlTop;
			}
			if(duration != 0) {
				$('html, body').animate({scrollTop : scrollTo}, duration);
			} else {
				$('html, body').scrollTop(scrollTo);
			}
		},
		refreshButtonsForTabs : function(tabIndices, currentTab) {
			var button_container = $(this).find('.ipt_fsqm_form_button_container'),
			prev_button = button_container.find('.ipt_fsqm_form_button_prev'),
			next_button = button_container.find('.ipt_fsqm_form_button_next'),
			submit_button = button_container.find('.ipt_fsqm_form_button_submit'),
			terms_wrap = button_container.prev('.ipt_fsqm_terms_wrap');
			var currentIndex = tabIndices.index(currentTab),
			totalIndices = tabIndices.length;

			// get the index of first tab and last tab
			var firstTabIndex = 0, lastTabIndex = totalIndices - 1;
			while ( tabIndices.eq(firstTabIndex).hasClass('iptUIFCHidden') ) {
				firstTabIndex++;
				if ( firstTabIndex >= totalIndices ) {
					firstTabIndex = totalIndices - 1;
					break;
				}
			}
			while ( tabIndices.eq(lastTabIndex).hasClass('iptUIFCHidden') ) {
				lastTabIndex--;
				if ( lastTabIndex < 0 ) {
					lastTabIndex = totalIndices - 1;
					break;
				}
			}

			if(currentIndex == lastTabIndex) { //Check if last
				prev_button.button('enable');
				next_button.button('disable');
				submit_button.button('enable');
				terms_wrap.show();
			} else if (currentIndex == firstTabIndex) { //Check if first
				prev_button.button('disable');
				next_button.button('enable');
				submit_button.button('disable');
				terms_wrap.hide();
			} else { //Somewhere in between
				prev_button.button('enable');
				next_button.button('enable');
				submit_button.button('disable');
				terms_wrap.hide();
			}
		}
	};

	$.fn.iptFSQMForm = function(method) {
		if(methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof(method) == 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.iptPluginUIFFront');
			return this;
		}
	};
})(jQuery);

jQuery(document).ready(function($) {
	$('.ipt_fsqm_form').iptFSQMForm();
});

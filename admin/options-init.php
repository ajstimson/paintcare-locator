<?php

    /**
     * For full documentation, please visit: http://docs.reduxframework.com/
     * For a more extensive sample-config file, you may look at:
     * https://github.com/reduxframework/redux-framework/blob/master/sample/sample-config.php
     */

    if ( ! class_exists( 'Redux' ) ) {
        return;
    }

    // This is your option name where all the Redux data is stored.
    $opt_name = "maplocator";

    /**
     * ---> SET ARGUMENTS
     * All the possible arguments for Redux.
     * For full documentation on arguments, please refer to: https://github.com/ReduxFramework/ReduxFramework/wiki/Arguments
     * */

    $theme = wp_get_theme(); // For use with some settings. Not necessary.

    $args = array(
        'opt_name' => 'maplocator',
        'use_cdn' => TRUE,
        'display_name' => 'Map Locator',
        'display_version' => '1.0.0',
        'page_title' => 'Map Locator',
        'update_notice' => TRUE,
        'admin_bar' => TRUE,
		'dev_mode' =>false,
        'menu_type' => 'menu',
        'menu_title' => 'Map Locator',
        'allow_sub_menu' => TRUE,
        'page_parent_post_type' => 'your_post_type',
        'customizer' => TRUE,
        'default_mark' => '*',
        'google_api_key' => 'AIzaSyBB-iLMk64QjHyhgASd24iKVeu7GUXDXYk',
        'hints' => array(
            'icon_position' => 'right',
            'icon_size' => 'normal',
            'tip_style' => array(
                'color' => 'light',
            ),
            'tip_position' => array(
                'my' => 'top left',
                'at' => 'bottom right',
            ),
            'tip_effect' => array(
                'show' => array(
                    'duration' => '500',
                    'event' => 'mouseover',
                ),
                'hide' => array(
                    'duration' => '500',
                    'event' => 'mouseleave unfocus',
                ),
            ),
        ),
        'output' => TRUE,
        'output_tag' => TRUE,
        'settings_api' => TRUE,
        'cdn_check_time' => '1440',
        'compiler' => TRUE,
        'page_permissions' => 'manage_options',
        'save_defaults' => TRUE,
        'show_import_export' => TRUE,
        'database' => 'options',
        'transient_time' => '3600',
        'network_sites' => TRUE,
    );

    

    Redux::setArgs( $opt_name, $args );



    Redux::setSection( $opt_name, array(
        'title'  => __( 'Map Icons', 'redux-framework-demo' ),
        'id'     => 'el-map-marker-alt',
        'desc'   => __( 'Set the icon colors for the markers', 'redux-framework-demo' ),
        'icon'   => 'el el-map-marker-alt',
        'fields' => array(
            array(
                'id'       => 'five-gallons',
                'type'     => 'media',
                'title'    => __( 'Accepts
up to 5 gallons', 'redux-framework-demo' ),
                
            ),
            array(
                'id'       => 'five-gallon-reuse',
                'type'     => 'media',
                'title'    => __( '
Reuse Program (5 Gallons)', 'redux-framework-demo' ),
                
            ),
			  array(
                'id'       => 'up-to-20-gallons',
                'type'     => 'media',
                'title'    => __( 'Accepts up to 10-20 gal.', 'redux-framework-demo' ),
                
            ),
              array(
                'id'       => 'up-to-20-gallons-reuse',
                'type'     => 'media',
                'title'    => __( '
Reuse Program (Up to 20 Gallons)', 'redux-framework-demo' ),
                        
                ),
			  array(
                'id'       => 'up-to-100-gallons',
                'type'     => 'media',
                'title'    => __( 'Accepts
up to 100 gal.', 'redux-framework-demo' ),
                
            ),
              array(
                'id'       => 'up-to-100-gallons-reuse',
                'type'     => 'media',
                'title'    => __( '
Reuse Program (Up to 100 Gallons)', 'redux-framework-demo' ),
                        
                ),
			  array(
                'id'       => 'hhw-programs',
                'type'     => 'media',
                'title'    => __( 'HHW Programs
(accepts other items)', 'redux-framework-demo' ),
                
            ),
              array(
                'id'       => 'hhw-reuse',
                'type'     => 'media',
                'title'    => __( '
Reuse Program (HHW)', 'redux-framework-demo' ),
                        
                ),
			
        )
    ) );

  Redux::setSection( $opt_name, array(
        'title'  => __( 'Map Design', 'redux-framework-demo' ),
        'id'     => 'design',
        'desc'   => __( 'Custom Map theme. You can get some great themes here: <a href="https://snazzymaps.com/">Click Here</a>', 'redux-framework-demo' ),
        'icon'   => 'el el-brush ',
        'fields' => array(
		  
             array(
                'id'       => 'map-api-key',
                'type'     => 'text',				
                'title'    => __( 'Google Maps API Key', 'redux-framework-demo' ),
                
            ),  
           	array(
                'id'       => 'map-height',
                'type'     => 'text',
				'default' =>'400',
                'title'    => __( 'Height in pixels', 'redux-framework-demo' ),
                
            ),
			
			array(
                'id'       => 'map-placeholder',
                'type'     => 'text',
				'default' => 'Enter Zipcode',
                'title'    => __( 'Placeholder text on search field', 'redux-framework-demo' ),
                
            ),
	
            array(
                'id'       => 'map-image',
                'type'     => 'media',
                'title'    => __( 'Attach your static map image', 'redux-framework-demo' ),
                
            ),
            array(
                'id'       => 'map-states',
                'type'     => 'text',
                                        'default' => 'CA, CO, DC, ME, MN, OR, RI, VT',
                'title'    => __( 'Define PaintCare States', 'redux-framework-demo' ),
                'subtitle'   => __( 'use two letter state abbreviation', 'redux-framework-demo' ),
            ),
		    array(
                'id'       => 'map-design',
                'type'     => 'textarea',
                'title'    => __( 'Copy and paste your JSON', 'redux-framework-demo' ),
                
            ),
			array(
                'id'       => 'map-css',
                'type'     => 'textarea',
                'title'    => __( 'Additional css on your map page', 'redux-framework-demo' ),
                
            ),
				
			
        )
    ) );
    /*
     * <--- END SECTIONS
     */

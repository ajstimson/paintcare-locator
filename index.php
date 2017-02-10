<?php
/*
Plugin Name: Paintcare Locator
Plugin URI: #
Description: AGoogle Maps locator for paintcare
Version: 1.0.0
Author: Anthony Brown
Author URI: http://www.codeable.io
*/
#make some definitions
define('PL_PLUGIN_URI',  plugins_url('/', __FILE__));
define('PL_PLUGIN_PATH', plugin_dir_path( __FILE__ ));
#include options framework by redux
include_once 'admin/admin-init.php';
#include misc functions file
include_once 'includes/functions.php';
#initiate the class
$PaintCareLocator = new PaintCareLocator;
#class build out. Functions are sent through filters in __construct()
class PaintCareLocator{
	
	
		#initiate the hooks
		function __construct(){
			
			#add the shortcode
			add_shortcode('paintcare_locator', array($this,'shortcode'));
			
			#load js and css scripts			
			add_action('wp_enqueue_scripts', array($this,'scripts'));
			
			#url for the data feed
			$this->paintcare_datafeed = 'http://12.156.76.219/Locator.svc/Getlocations';			
			
			#ajax calls
			add_action( 'wp_ajax_pc_get_json', array($this,'pc_get_json' ));
			add_action( 'wp_ajax_nopriv_pc_get_json', array($this,'pc_get_json' ) );
			
			
		}
		
	
		#load javascript and css scripts
		function scripts(){
			global $maplocator;
			
		#always make sure jquery is loaded	
		wp_enqueue_script('jquery');
	
			  
		#Register the script
		wp_register_script( 'paintcare-locator', plugins_url('js/scripts.js', __FILE__), array('jquery') );
		
		#load the map icons for location types
		$map_icons = array($maplocator['location-type-0']['url'],
						   $maplocator['location-type-1']['url'],
						   $maplocator['location-type-2']['url'],
						   $maplocator['location-type-3']['url'],
						   $maplocator['location-type-4']['url']);
		# Localize the script with new data
		$translation_array = array(
			'plugin_uri' => PL_PLUGIN_URI,
			'ajax_url' => admin_url( 'admin-ajax.php' ),
			'api_key' => $maplocator['map-api-key'],
			'default_lat'=>$maplocator['map-default-lat'],
			'default_lng'=>$maplocator['map-default-lng'],
			'default_zoom'=>$maplocator['map-default-zoom'],			
			'map_height' => $maplocator['map-height'],
			'map_icons' => $map_icons,
			
			
		);
		
		#set up localization variables so we can use them in our js file
		wp_localize_script(  'paintcare-locator', 'paintcare', $translation_array );
		
		
		}
		
		
		
		#get the json content from remote url
		function get_json($vars){
			
			$args = array(
						'method' => 'POST',
						'timeout' => 45,
						'httpversion' => '1.0',
									'headers' => array(
										'Content-Type' => 'application/javascript'
									),
						'body' => json_encode(array( 'Lat' => $vars['Lat'], 'Lng' => $vars['Lng'] , 'St' => $vars['St']))
						);
	
			#make remote request
			$response =  wp_remote_post($this->paintcare_datafeed, $args );
			#did we get an error?
			if ( is_wp_error( $response ) ) {
			   $body['error'] = $response->get_error_message();
			   return json_encode($body);
			} else {
				#fix response json
				$body = str_replace('{"GetLocationsResult":"', '',$response['body']);
				$body = str_replace(']"}', ']',$body);
				#convert to array
				return stripslashes($body);
			}
						
			
			
		}
		#ajax search and get locations
		function pc_get_json(){
			
			#get our post variables
			$vars['Lat'] = $_POST['lat'];
			$vars['Lng'] = $_POST['lng'];
			$vars['St']  = $_POST['st'];
			
			#get the json
			echo $this->get_json($vars);
			
		die();	
		}
		#main shortcode function
		function shortcode(){
			global $map_vars,$maplocator;
			
			#include scripts only on shortcode page
			wp_enqueue_script( 'paintcare-locator');
			if($maplocator['map-design'] != ''){
			wp_add_inline_script( 'paintcare-locator', 'var map_theme = '.$maplocator['map-design'].'');	  
			}else{
			wp_add_inline_script('paintcare-locator', 'var map_theme = ""');	
			}
		
		
			#get json 	
			$map_vars['api_key'] = $this->google_api_key ;
			$map_vars['center']['lat'] = '36.8701483';
			$map_vars['center']['lng'] = '-92.8772965';
			$map_vars['zoom'] = '4';
			#get the template
			ob_start();
			pl_get_template('map');
			$content = ob_get_contents();
			ob_end_clean();
			return $content;
			
		}
	
	
	
}
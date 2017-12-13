<?php
/*
Plugin Name: Paintcare Locator
Plugin URI: #
Description: PaintCare's Drop-off Site Locator
Version: 1.1.1
Author: Andrew Stimson and Anthony Brown
Author URI: http://www.codeable.io
Author Email: andrew@applejuice.codes
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
			$this->paintcare_datafeed = 'https://locator.paintcare.org/Locator.svc/Getlocations';

			#ajax calls
			add_action( 'wp_ajax_pc_get_json', array($this,'pc_get_json' ));
			add_action( 'wp_ajax_nopriv_pc_get_json', array($this,'pc_get_json' ) );
			
			add_action( 'wp_ajax_pc_get_cache_geocode', array($this,'get_cache_geocode' ));
			add_action( 'wp_ajax_nopriv_pc_get_cache_geocode', array($this,'get_cache_geocode' ) );
			
			add_action( 'wp_ajax_pc_set_cache_geocode', array($this,'set_cache_geocode' ));
			add_action( 'wp_ajax_nopriv_pc_set_cache_geocode', array($this,'set_cache_geocode' ) );
			
		
			add_action( 'admin_notices',array($this,'empty_cache'));
		
		}
		
		function empty_cache(){
			global $wpdb;
			
			if($_GET['paintcare_empty_cache'] == 1){
				
				$wpdb->query( "DELETE FROM " . $wpdb->prefix . "options
								 WHERE `option_name` LIKE ('_transient_%')");

				$wpdb->query( "DELETE FROM " . $wpdb->prefix . "options
								 WHERE `option_name` LIKE ('_transient_%')");
		
		echo '  <div class="notice notice-success is-dismissible">
        <p>Deleted Cache!</p>
    </div>
';
			
			}
		
		
			
		}
		function set_cache_geocode(){
		
		$message['success'] = 0;
        	if($_POST['pc_address'] != ''){
				
		$message['success'] = 1;
				$address = json_decode(stripslashes($_POST['pc_address']));
				$transient = set_transient(md5($_POST['address']), $address, 180 * DAY_IN_SECONDS);
				$message['transient'] = get_transient(md5($_POST['address']));
				$message['transient_name'] =md5($_POST['address']); 
					}
		echo json_encode($message);	
			die();
		}
		function get_cache_geocode(){
		
        	if($_POST['pc_address'] != ''){
				$message['success'] = 1;
				$message['geocode'] = '';
				$message['address'] = $_POST['pc_address'];
				$message['transient_name'] = md5($_POST['pc_address']);
				
				$transient = get_transient(md5($_POST['pc_address']));
				
				if($transient == false){
				$message['success'] = 0;					
				}else{
				$message['geocode'] =  $transient;	
				}
				
				
				echo json_encode($message);
				
			}		
				
			
			die();
		}
		
	
	
		#load javascript and css scripts
		function scripts(){
			global $maplocator;
			
		#always make sure jquery is loaded	
		wp_enqueue_script('jquery');
		wp_enqueue_script( 'jquery-cookie', plugins_url('js/cookie.js', __FILE__), array('jquery') );  
		#Register the script
		wp_register_script( 'paintcare-locator', plugins_url('js/scripts.js', __FILE__), array('jquery','jquery-cookie') );



		// $container_sizes = file_get_contents('http://12.156.76.219/Locator.svc/getContainerSizes');
		// $container_sizes = json_decode($container_sizes, true);
		// $container_sizes = $container_sizes['getContainerSizesResult'];
		// $container_sizes = json_decode($container_sizes, true);
		$map_states = json_encode($maplocator['map-states']);
		// $map_states = explode( ',', $map_states);
		// $map_states = preg_replace('/\s+/', '', $map_states);
		// $map_states = json_encode($map_states);


		#load the map icons for location types
		$map_icons = array($maplocator['five-gallons']['url'],
							$maplocator['five-gallon-reuse']['url'],
						   $maplocator['up-to-20-gallons']['url'],
						   $maplocator['up-to-20-gallons-reuse']['url'],
						   $maplocator['up-to-100-gallons']['url'],
						   $maplocator['up-to-100-gallons-reuse']['url'],
						   $maplocator['hhw-programs']['url'],
						   $maplocator['hhw-reuse']['url']
						   );



		# Localize the script with new data
		$translation_array = array(
			'plugin_uri' => PL_PLUGIN_URI,
			'ajax_url' => admin_url( 'admin-ajax.php' ),
			'api_key' => $maplocator['map-api-key'],
			'default_lat'=>'36.8701483',
			'default_lng'=>'-92.8772965',
			'default_zoom'=> '4',
			'map_height' => $maplocator['map-height'],
			'map_states' => $map_states,
			'map_icons' => $map_icons,
		);

		
		
		#set up localization variables so we can use them in our js file
		wp_localize_script(  'paintcare-locator', 'paintcare', $translation_array);
		}
		
		
		function cache_geocode(){
			
			
			
		die();	
		}
		#get the json content from remote url
		function get_json($vars){
			
			$cached_json = get_transient(''.$vars['Lat'].''. $vars['Lng'].''.$vars['St'].'');
			
			if($cached_json == false){
			
			$args = array(
						'method' => 'POST',
						'timeout' => 45,
						'httpversion' => '1.0',
									'headers' => array(
										'Content-Type' => 'application/javascript'
									),
						'body' => json_encode(array( 'Lat' => $vars['Lat'], 'Lng' => $vars['Lng'] , 'St' => $vars['St']))
						);
			
			#make remote requests
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
				set_transient( ''.$vars['Lat'].''. $vars['Lng'].''.$vars['St'].'', $body, 12 * HOUR_IN_SECONDS );
				return stripslashes($body);
			}
			
			}else{
				
				
			return stripslashes($cached_json) ;	
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
		
		
			#get the template
			ob_start();
			pl_get_template('map');
			$content = ob_get_contents();
			ob_end_clean();
			return $content;
			
		}
	
	
	
}
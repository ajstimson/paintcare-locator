<?php

#Get the template by slug
# copy /templates/map.php to  /paintcare-locator/map.php to overide the template
function pl_get_template( $slug){


	
	if(file_exists(get_stylesheet_directory() . '/paintcare-locator/map.php')){
	$template = get_stylesheet_directory() . '/paintcare-locator/map.php';	
	}else{
    $template = ''.PL_PLUGIN_PATH.'templates/'.$slug.'.php';
	}
	include $template;
	
}
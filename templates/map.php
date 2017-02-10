<?php
/* Google map Template */
#map_vars variables sent to this page
#maplocator comes from our options panel
global $map_vars,$maplocator;

#print_r($map_vars);
?>

	<!-- Inline styles for map locator -->
	<style>
    #initPlMap{height:<?php echo $maplocator['map-height']; ?>px;width:100%;}
	#PlMapSearch{margin:10px 0px;}
	
	#pac-input{width:150px;}
	#pac-submit{width:100px;}
	
	
	#maps-content{font-size:.9em;}
	#maps-content p {
    font-size:12px;
    color: #555555;
}
	<?php echo $maplocation['map-css']; ?>
    </style>
    
    
    
<!-- Start Map Locator Form -->
<div id="PlMapSearch">
<form action="" method="post" id="pac-input-form">
<input id="pac-input" class="controls" type="number" placeholder="<?php echo $maplocator['map-placeholder']; ?>" maxlength="5" >
<input id="pac-submit" type="submit" value="<?php echo $maplocator['map-button']; ?>" name="search" ></form>
<div class="map-search-output"></div>
</div>
<!-- End Map Locator Form -->



<!-- Start Map Output-->
<div id="initPlMap"  ></div>
<!-- End Map Output-->



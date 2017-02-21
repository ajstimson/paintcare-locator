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

	.map-search-map{float:left;width:70%;}
	.map-search-list{float:left;width:30%;}
	.map-search-list .map-list-item{padding:0px 0px 10px 10px;border-bottom:1px solid #CCC;font-size:12px;}
	.map-search-list .map-list-item-title span{font-weight:bold;}
	.map-search-list .map-list-item-title a{font-weight:bold; text-decoration:underline}
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
<div class="map-search-map"><div id="initPlMap"  ></div></div>
<div class="map-search-list"></div>
<div style="clear:both"></div>
<!-- End Map Output-->



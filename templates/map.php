<?php
/* Google map Template */
#map_vars variables sent to this page
#maplocator comes from our options panel
global $map_vars,$maplocator;

// print_r($map_vars);
?>

	<!-- Inline styles for map locator -->
<style>
	<?php
		$height = $maplocator['map-height'];
	?>
    #initPlMap, #initial-map{height:<?php echo $height; ?>px;width:100%;} .map-search-list{height:<?php echo $height - 50; ?>px} @media(max-width: 667px) { #initPlMap, #initial-map{height:260px;}.map-search-list{height: auto;}}
	<?php echo $maplocator['map-css']; ?>
    </style>


<div class="locations-container">
	<!-- Start Map Locator Form -->
	<div id="PlMapSearch">
		<form action="" method="post" id="pac-input-form">
			<input id="pac-input" class="controls" type="text" placeholder="<?php echo $maplocator['map-placeholder']; ?>"  >
			<button type="submit" id="pac-submit" class="icon-search icon-large" name="search"><i class="fa fa-search"></i></button>
		</form>
		<div class="map-search-message"><p><b>ENTER: Zip Code OR City, State OR Street Address</b></p></div>
		<div class="map-search-output"></div>
	</div>
	<!-- End Map Locator Form -->
	<div class="map-search-list"></div>
	<div class="mobile-cards"></div>
</div>


<!-- Start Map Output-->
<div class="map-search-map">
	<!-- <div class="uil-load-css" style="transform:scale(0.6);"><div style="top:80px;left:93px;width:14px;height:40px;background:#969696;-webkit-transform:rotate(0deg) translate(0,-60px);transform:rotate(0deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#969696;-webkit-transform:rotate(30deg) translate(0,-60px);transform:rotate(30deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#969696;-webkit-transform:rotate(60deg) translate(0,-60px);transform:rotate(60deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#969696;-webkit-transform:rotate(90deg) translate(0,-60px);transform:rotate(90deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#969696;-webkit-transform:rotate(120deg) translate(0,-60px);transform:rotate(120deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#969696;-webkit-transform:rotate(150deg) translate(0,-60px);transform:rotate(150deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#969696;-webkit-transform:rotate(180deg) translate(0,-60px);transform:rotate(180deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#969696;-webkit-transform:rotate(210deg) translate(0,-60px);transform:rotate(210deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#969696;-webkit-transform:rotate(240deg) translate(0,-60px);transform:rotate(240deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#969696;-webkit-transform:rotate(270deg) translate(0,-60px);transform:rotate(270deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#969696;-webkit-transform:rotate(300deg) translate(0,-60px);transform:rotate(300deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#969696;-webkit-transform:rotate(330deg) translate(0,-60px);transform:rotate(330deg) translate(0,-60px);border-radius:10px;position:absolute;"></div></div> -->
	<div id="initial-map" style="background-image:url(<?php echo $maplocator['map-image']['url'] . ')'?>"></div>
	<div id="initPlMap"></div>
</div>
<div style="clear:both"></div>
<!-- End Map Output-->
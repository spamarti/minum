var gui = require("nw.gui");
var tld = require("tldjs");

var win = gui.Window.get();

win.focus();

if (process.platform === "darwin")
{
	var nativeMenuBar = new gui.Menu(
	{
		type: "menubar"
	});
	nativeMenuBar.createMacBuiltin("minum");
	win.menu = nativeMenuBar;
}

//debug
//win.showDevTools();

//App loaded.
$(function()
{
	//Close button.
	$("#closeButton").on("mousedown", function()
	{
		gui.App.quit();
	});	
	
	//Minimize button.
	$("#minButton").on("mousedown", function()
	{
		win.minimize();
	});
	
	//Maximize button.
	$("#fullButton").on("mousedown", function()
	{
		win.maximize();
	});
	
	$("#title").on("mousedown", function()
	{
		$("#info").fadeIn(null, function()
		{
			$("#address").focus();
			$("#address").select();
		});
	});
	
	//Keydown in address bar.
	$("#address").on("keydown", function (e) 
	{
		//Enter is pressed.
  		if (e.which == 13) 
		{
			//Hide the info page. 
    		$("#info").hide();

			//Get the value of the address bar.
			var search = $("#address").val();

			//If top level domain exists, and there is text on both sides of the dot.
			if (tld.tldExists(search) && search.split(".").length > 1 && search.split(".")[0].length > 0)
			{
				//Add http to the url if it's missing.
				if (!/^https?/ig.test(search))
				{
					search = "http://" + search;
				}
				
				$("#title").text(search);	
			}
			else
			{
				$("#title").text(search);
				search = "https://www.google.com/search?q=" + search;
			}
			
			$("#view").attr("src", search);
  		}
	});
	
	//If exit is pressed leave info screen.
	$("#info").on("keydown", function(e)
	{
		if (e.which === 27)
		{
			$("#info").hide();
		}
	});

	//Leave info screen if background is clicked.
	$("#info").on("mousedown", function(e)
	{
		if (e.target.id === "info")
		{
			$("#info").hide();
		}
	});
});

//Force links that target _blank to open in the same frame (until tabs are implemented?).
win.on("new-win-policy", function(frame, url, policy)
{
	policy.forceCurrent();
});

win.on("document-end", function(frame) 
{
    if (frame && frame.hasOwnProperty("id") && frame.id === "view")
    {
        setTimeout(function()
        {
            getBarColor();
        },100);
    }
});

function getBarColor()
{
    win.capturePage(function(img) 
    {   
        var canvas = document.getElementById("color").getContext("2d");
        var image = document.getElementById("colorImage");
        
        image.src = img;
        
        //Draw the image to our invisible canvas. 
        canvas.drawImage(image,0,0);
        
        //Get the pixel color right below the titlebar. 
        var pixelData = canvas.getImageData(5, 35, 1, 1).data;
        
        //Change the title bar background color to the color found above. 
		document.getElementById("bar").style.backgroundColor = 'rgb(' + [pixelData[0],pixelData[1],pixelData[2]].join(',') + ')';

		//Get the color the title bar text should be based on the title bar background. Currently black or white. 
        var inv = idealTextColor({R: pixelData[0], G: pixelData[1], B: pixelData[2]});
        
        //Set the title bar text.
        document.getElementById("title").innerHTML = document.getElementById("view").contentDocument.title;

        //Set the title bar text color. 
        document.getElementById("title").style.color = inv;
		
		//Set the address bar url to the current url.
		$("#address").val($("#view")[0].contentWindow.location.href);
        
    }, "png");
}

function idealTextColor(components) 
{

   var nThreshold = 105;
   var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);

   return ((255 - bgDelta) < nThreshold) ? "#000000" : "#ffffff";   
}
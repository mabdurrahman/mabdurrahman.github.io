jQuery(document).ready(function($) {


    /*======= Skillset *=======*/
    
    $('.level-bar-inner').css('width', '0');
    
    $(window).on('load', function() {

        $('.level-bar-inner').each(function() {
        
            var itemWidth = $(this).data('level');
            
            $(this).animate({
                width: itemWidth
            }, getParameterByName("printmode") === "true"? 0 : 800);
            
        });

    });
    
    /* Bootstrap Tooltip for Skillset */
    $('.level-label').tooltip();
    
    
    /* jQuery RSS - https://github.com/sdepold/jquery-rss */
    
    $("#rss-feeds").rss(
    
        //Change this to your own rss feeds
        "http://feeds.feedburner.com/TechCrunch/startups",
        
        {
        // how many entries do you want?
        // default: 4
        // valid values: any integer
        limit: 3,
        
        // the effect, which is used to let the entries appear
        // default: 'show'
        // valid values: 'show', 'slide', 'slideFast', 'slideSynced', 'slideFastSynced'
        effect: 'slideFastSynced',
        
        // outer template for the html transformation
        // default: "<ul>{entries}</ul>"
        // valid values: any string
        layoutTemplate: "<div class='item'>{entries}</div>",
        
        // inner template for each entry
        // default: '<li><a href="{url}">[{author}@{date}] {title}</a><br/>{shortBodyPlain}</li>'
        // valid values: any string
        entryTemplate: '<h3 class="title"><a href="{url}" target="_blank">{title}</a></h3><div><p>{shortBodyPlain}</p><a class="more-link" href="{url}" target="_blank"><i class="fa fa-external-link"></i>Read more</a></div>'
        
        }
    );
    
    /* Github Calendar - https://github.com/IonicaBizau/github-calendar */
    GitHubCalendar("#github-graph", "mabdurrahman");
    
    
    /* Github Activity Feed - https://github.com/caseyscarborough/github-activity */
    GitHubActivity.feed({ username: "mabdurrahman", selector: "#ghfeed" });

    if (getParameterByName("printmode") === "true") {
      $('.non-printable').hide();
    }
    
    if (!!!getParameterByName("printmode")) {
      addScreenshotsDiscoverMoreIndicators('.screenshots-gallery');
      initPhotoSwipeFromDOM('.screenshots-gallery');
    }
});

function getParameterByName(name, url) {
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function addScreenshotsDiscoverMoreIndicators(gallerySelector) {
  $(gallerySelector + '>*:last-child>.thumbnail').each(function(index) {
    var el = $(this);
    var parent = el.parent().parent('.screenshots-gallery');
    var pattern = parent.attr('data-pattern');
    
    var screenshotsCount = parent.attr('data-pattern').split(",")[0].split("|")[2];
    
    el.attr("data-after", screenshotsCount - parent.children('div').length);
    el.append("<div class='captionbg' />");
  });
  
  $(gallerySelector + '>div').addClass("minpadding");
}

function initPhotoSwipeFromDOM(gallerySelector) {
  
  var prepareScreenshotsDimensionsMap = function(deferred) {
    $.ajax({
      url: "assets/images/screenshots/map.csv",
      type: 'get',
      success: function(data) {
        var screenshots = {};
        
        for (var line of data.split("\n")) {
          var src = line.split(",")[0];
          var width = line.split(",")[1];
          var height = line.split(",")[2];
          
          screenshots[src] = {width: width, height: height};
        }
        
        window.screenshots = screenshots;
        
        if (!!deferred) {
          deferred.resolve();
        }
      },
      error: function(jqXHR, textStatus, errorThrow){
        if (!!deferred) {
          deferred.reject();
        }
      }
    });
  };
  
  var getScreenshotsForElement = function(el) {
    var screnshotsRootDir = "assets/images/screenshots/";
    var itemsPatterns = el.dataset.pattern;
    
    var result = [];
    
    for (var itemsPattern of itemsPatterns.split(",")) {
      var subDir = itemsPattern.split("|")[0] || null;
      var imagesType = itemsPattern.split("|")[1] || "png";
      var imagesCount = itemsPattern.split("|")[2] || 0;
      
      if (!!subDir && imagesCount > 0) {
        for (var i = 0; i < imagesCount; i++) {
          var src = screnshotsRootDir + subDir + "/" + subDir + i + "." + imagesType;
          
          result.push(src);
        }
      }
    }
    
    return result;
  };
  
  var getScreenshotsItemsForElement = function(el) {
    var screenshotsSrcs = getScreenshotsForElement(el),
        items = [],
        item;
    
    Array.prototype.forEach.call(
      screenshotsSrcs,
      (src) => {
        
        var prop = window.screenshots[src];
        
        item = {
          src: src,
          msrc: src.replace("screenshots", "thumbs"),
          w: prop.width,
          h: prop.height
        };
        
        items.push(item);
    });
    
    return items;
  };

  // find nearest parent element
  var closest = function closest(el, fn) {
    return el && (fn(el)? el : closest(el.parentNode, fn));
  };

  // triggers when user clicks on thumbnail
  var onThumbnailsClick = function(e) {
    if (!!!window.screenshots) {
      var prepareDeferred = $.Deferred();
      
      prepareScreenshotsDimensionsMap(prepareDeferred);
      
      $.when(prepareDeferred).then(() => {
        onThumbnailsClick(e);
      });
      
      return;
    }
    
    e = e || window.event;
    e.preventDefault ? e.preventDefault() : e.returnValue = false;

    var eTarget = e.target || e.srcElement;

    // find root element of slide
    var clickedListItem = closest(eTarget, function(el) {
      return (el.className && el.className.indexOf('thumbnail') != -1)
              || (el.innerHTML && el.innerHTML.toLowerCase().indexOf('screenshots') != -1);
    });

    if (!clickedListItem) {
      return;
    }

    // find index of clicked item by looping through all child nodes
    // alternatively, you may define index via data- attribute
    var clickedGallery = closest(clickedListItem, function(el) {
      return (el.className && el.className.indexOf(gallerySelector.substr(1)) != -1);
    }), index;

    index = clickedListItem.dataset.index || 0;

    if (index >= 0) {
      // open PhotoSwipe if valid index found
      openPhotoSwipe(index, clickedGallery);
    }
    return false;
  };

  // parse picture index and gallery index from URL (#&pid=1&gid=2)
  var photoswipeParseHash = function() {
    var hash = window.location.hash.substring(1),
    params = {};

    if (hash.length < 5) {
      return params;
    }

    var vars = hash.split('&');
    for (var i = 0; i < vars.length; i++) {
      if (!vars[i]) {
        continue;
      }
      var pair = vars[i].split('=');  
      if (pair.length < 2) {
        continue;
      }           
      params[pair[0]] = pair[1];
    }

    if (params.gid) {
      params.gid = parseInt(params.gid, 10);
    }

    return params;
  };

  var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
    var pswpElement = document.querySelectorAll('.pswp')[0],
        gallery,
        options,
        items;

    items = getScreenshotsItemsForElement(galleryElement);

    // define options (if needed)
    options = {
      // define gallery index (for URL)
      galleryUID: galleryElement.getAttribute('data-pswp-uid'),

      getThumbBoundsFn: function(index) {
        var src = items[index].src.replace("screenshots", "thumbs");
        
        var thumbnail = document.querySelector("img[src='" + src + "']:not(.pswp__img)") || document.querySelector("img[src^='" + src.replace(/\d+\.[^\.]+/, '') + "']:not(.pswp__img)");
        var pageYScroll = window.pageYOffset || document.documentElement.scrollTop
        
        var result;
        
        if (!!thumbnail) {
          var rect = thumbnail.getBoundingClientRect(); 
          
          return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
        }
        
        return {x:0, y:pageYScroll, w:0};
      }
    };

    // PhotoSwipe opened from URL
    if (fromURL) {
        if (options.galleryPIDs) {
          // parse real index when custom PIDs are used 
          // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
          for (var j = 0; j < items.length; j++) {
            if (items[j].pid == index) {
              options.index = j;
              break;
            }
          }
        } else {
          // in URL indexes start from 1
          options.index = parseInt(index, 10) - 1;
        }
    } else {
      options.index = parseInt(index, 10);
    }

    // exit if index not found
    if (isNaN(options.index)) {
      return;
    }

    if (disableAnimation) {
      options.showAnimationDuration = 0;
    }

    // Pass data to PhotoSwipe and initialize it
    gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
    gallery.init();
  };
  
  var prepareDeferred = $.Deferred();
  
  // Prepare screenshots dimensions map from csv file
  prepareScreenshotsDimensionsMap(prepareDeferred);
  
  $.when(prepareDeferred).then(() => {
    
    // loop through all gallery elements and bind events
    var galleryElements = document.querySelectorAll(gallerySelector);

    for (var i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', i + 1);
        galleryElements[i].onclick = onThumbnailsClick;
    }

    // Parse URL and open gallery if it contains #&pid=3&gid=1
    var hashData = photoswipeParseHash();
    if (hashData.pid && hashData.gid) {
        openPhotoSwipe(hashData.pid, galleryElements[hashData.gid - 1], true, true);
    }
    
  });
};
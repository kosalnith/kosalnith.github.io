/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/
!function(e){var t,n,o,r,a=function(e){var t=e.message;"undefined"!=typeof console&&console.warn&&console.warn("[Deprecation] ".concat(t))};window.Modernizr=(n=(t={target:e,deprecatedProperty:"touchevents",message:"The touchevents property of Modernizr has been deprecated in drupal:9.4.0 and is removed from drupal:10.0.0. There will be no replacement for this feature. See https://www.drupal.org/node/3277381."}).target,o=t.deprecatedProperty,r=t.message,Proxy&&Reflect?new Proxy(n,{get:function(e,t){t===o&&a({message:r});for(var n=arguments.length,s=new Array(n>2?n-2:0),c=2;c<n;c++)s[c-2]=arguments[c];return Reflect.get.apply(Reflect,[e,t].concat(s))}}):n),document.documentElement.classList.contains("touchevents")||document.documentElement.classList.contains("no-touchevents")||e.addTest("touchevents",(function(){var t;if(a({message:"The Modernizr touch events test is deprecated in Drupal 9.4.0 and will be removed in Drupal 10.0.0. See https://www.drupal.org/node/3277381 for information on its replacement and how it should be used."}),"ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch)t=!0;else{var n=["@media (",e._prefixes.join("touch-enabled),("),"heartz",")","{#modernizr{top:9px;position:absolute}}"].join("");e.testStyles(n,(function(e){t=9===e.offsetTop}))}return t}))}(Modernizr);
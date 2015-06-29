# ga-wrapper
Google Analytics wrapper, automation via inline attributes and event callbacks.

Google Analytics wrapper (gaw) assumes use of the category, action, and label parameters, and that category is the top-level element in your event naming conventions.  

# Setup  
```
<script src="/javascript/gaWrapper.js"></script>`  
<script>var gaw = new GAWrapper({});</script>
```
  
# Options  
**Prefix**  
String, prefixes category parameter  
  
**testMode**  
Boolean, disables push to analytics, disables link click navigation  
  
**verbose**  
Boolean, enables verbose logging

# Inline event parameters
gaw uses a global event listener and inline data attributes to determine if a push event is necessary. Given the following code, clicking on `li` would send an event with the `category` "Featured Models", the `action` "Clicked Product Category", and the `label` "Example Product".  
```
<div data-ga-category="Featured Models">
  <ul data-ga-action="Clicked Product Category">
    <li data-ga-label="Example Product">Example</li>
    <li data-ga-label="Example Product">Example</li>
  </ul>
</div>
```  
  
# Dynamic event parameters  
gaw also supports dynamic parameters via a callback function. The following would intercept any call with an action parameter that equals "Clicked Product Category", and sets the label parameter to the clicked element's text attribute.
```
gaw.register('label', {'action': 'Clicked Product Category'}, function(currentLabel, element, callback) {
  callback($(element).text());
});
```  
  
# API  
***gaw.Register(dynamicType, match, fn)***  
registers a callback to trigger given the specified event being matched.  
  
  
dynamicType, String, the event parameter to be dynamic.  
  
match, Object, key is the event parameter type to match & value is the string to match it with.  
  
fn, Function, callback function to call when the event is triggered.  
  
***gaw.Push(category, action, label, element)***  
pushes an event to Google Analytics given non-empty params. Element is optional.  
  
  
category, String, the event category.  
  
action, String, the event action.  
  
label, String, the event label.  
  
element, Object, the element that triggered the push.  
  
# Dependencies
***jQuery***

### images
- because we need to run application in some web sub-folder (i.e. http://server/csob/ ), it is needed to
  * do not use img with src attributes - instead use img with some class
  * use content:url(/assets/...path to your image) for specifying image url
  * when using less functions, use relative paths

### forms.less
- application wide styles for forms and kendo form elements

### buttons.less
- application wide styles for buttons and kendo buttons
  * use only kendo buttons throughout the application
  * use classes: .k-button with .k-primary, .k-success, .k-danger or just .k-button for default style
  
- icon buttons are used only for major user actions and are using fontawesome icons 
  * use classes: .icon-button with .-primary, .-success, .-danger or just .icon-button for default style


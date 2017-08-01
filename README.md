# Qlik Sense extension for field and variable selections.

This extension is an "all in one" selection component with many customization properties.
## Features
- selector for fields and variables
- supports select only one and default value selection - so when you enter to a document or a sheet, you can have default values selected
- will fit on one line - you can disable Qlik Sense default header, paddings, margins and do other tricks to enhance standard visualization
- renders as a list, button row, checkbox or drop down selector
- can set variable value from predefined list or via date picker
  - two variables can be set at the same selection (if you need a value for UI and value for other usage)
  - date picker can limit to max date via variable
- mobile zoom effect can be disabled. No need for three clicks if you want to select something. **Only one click is enough!!**
- several posibilities for visual changes like colors, borders etc. Custom CSS classes, HTML attributes can be applied to rendering
- supports hiding a field from Qlik Sense's selection row
- supports transparency

And the plugin is supposed to be very light weight. It has no big libraries attached to it. In this way your Qlik Sense application is able to stay as fast as possible.

## Will be done later:
- source code will be cleaned
- more visualization parameters added, maybe

For date picker jQuery UI component is used. CSS is parsed for only required parts.

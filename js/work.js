/**Create a more complete customized quill rich text format 
 * a complete list of format tools can be found at:
 * https://quilljs.com/docs/formats/ 
*/
//an example is given at : 
//https://stackoverflow.com/questions/43728080/how-to-add-font-types-on-quill-js-with-toolbar-options

function makeQuill(parentBodyDom,id_toolbarbox, id_editorbox ){

    /**the following part is for adding buttons for table editing. 
     * It is enabled by Quill 2.0.0.dev.3. Right now, these functions are not built into the toolbox...
    */
    var thetabletoolbox = d3.select(parentBodyDom).append('div').attr('id', 'thetabletoolbox')
    var tagname = 'button'
    var tableoptionlist = [
        {attrs:[
            {attr:'id', value:'insert-table'},
          ], text:'Insert Table'},
        {attrs:[
            {attr:'id', value:'insert-row-above'},
          ], text:'Insert Row Above'},
        {attrs:[
            {attr:'id', value:'insert-row-below'},
          ], text:'Insert Row Below'},
        {attrs:[
            {attr:'id', value:'insert-column-left'},
          ], text:'Insert Column Left'},
        {attrs:[
            {attr:'id', value:'insert-column-right'},
          ], text:'Insert Column Right'},
        {attrs:[
            {attr:'id', value:'delete-row'},
          ], text:'Delete Row'},
        {attrs:[
            {attr:'id', value:'delete-column'},
          ], text:'Delete Column'},
        {attrs:[
            {attr:'id', value:'delete-table'}
          ], text:'Delete Table'}
    ]
    makeqlelms(thetabletoolbox,tableoptionlist,tagname)

    /**End of table edition box */

    //0.1 dynamiclly write css style lines for font setting
    // more fonts can be found at https://fonts.google.com/ just cite the font in html!
    var fontlist=[
      {attr:'selected', value:'', text:'Roboto'},
      {attr:'value', value:'timesnewroman', text:'Times New Roman'}, // I made it up. When the fontname is not knonw by js or quill app, it'll be displayed as times new roman!
      // {attr:'value', value:'helvetica', text:'Helvetica'},// this is very close to Roboto
      {attr:'value',value:'inconsolata', text:'Inconsolata'},
      {attr:'value',value:'indieflower', text:'Indie Flower'},
      {attr:'value', value:'appleultralight', text:'Source Sans Pro'},  
      // {attr:'value',value:'tinos', text:'Tinos'} // this is also close to Roboto
    ]
    //0.2 prepare a list of font values for Font.whitelist setting in quill app
    var fontsforwhitelist=[]
    fontlist.forEach(d=>{
      fontsforwhitelist.push(d.value)
    })

    //the following is to set css style in the head part of the index html.
    //however, check the global variable quillcssloaded first (which is init in init.js)
    //If quillcssloaded !==0, skip the following css style strip creating 
    if (quillcssloaded === 0){
            //0.3 set css style for labels in font selector options
            d3.select('head').append('style').text(
                function () { 
                var cssStr='';
                fontlist.forEach(d=>{
                    var theStr = '#toolbar-container .ql-font span[data-label="' + d.text 
                                + '"]::before { font-family: "' + d.text + '";}'
                    if (d.value === 'appleultralight'){
                    theStr = '#toolbar-container .ql-font span[data-label="' + d.text 
                            + '"]::before { font-family: "' + d.text + '"; font-weight: 200;}'
                    }
                    cssStr=cssStr + theStr
                })
                return cssStr
                }
            )
            //0.4 set css style for text contents (it can be combined with the css setting above, but i'd rather separate them)
            d3.select('head').append('style').text(
                ()=>{ // this is the same as function(){}
                var cssStr='';
                fontlist.forEach(d=>{
                    var theStr = '.ql-font-' + d.value + '{font-family: "' + d.text + '";}'
                    if (d.value === 'appleultralight'){
                    theStr = '.ql-font-' + d.value + '{font-family: "' + d.text + '"; font-weight: 200;}'
                    }
                    cssStr=cssStr + theStr
                })
                return cssStr
                }
            )
            quillcssloaded=1;
    } // end if
    //the above is to set css style in the head part of the index html.
  
  //1. create a toolbar container
  var qltoolbarbox = d3.select(parentBodyDom).append('div').attr('id', id_toolbarbox)

  //1.a make ql-fontfamily selector
  /**  how to use apple san francisco fonts?
   * https://stackoverflow.com/questions/32660748/how-to-use-apples-new-san-francisco-font-on-a-webpage
   */
  var selectorClassname = 'ql-font'
  // prepare a list of options (note: one of which is for default value 'selected', 'Default')
  var selectiondata=fontlist
  makeqlSelector(qltoolbarbox,selectorClassname,selectiondata )


  //1.b make ql-fontsize selector, an static example can be found in learning.js
  var selectorClassname = 'ql-size'
  // Need to prepare a whitelist for Size.whitelist for customized sizes
  var selectiondata=[
    {attr:'value', value:'10px', text:'10px'},
    {attr:'selected',value:'', text:'Normal'}, // it'll be 13px! strange
    {attr:'value',value:'16px', text:'16'},  
    {attr:'value',value:'20px', text:'20'},
    {attr:'value',value:'36px', text:'36'},
    {attr:'value',value:'48px', text:'48'},
    {attr:'value',value:'72px', text:'72'}
  ]
  makeqlSelector(qltoolbarbox,selectorClassname,selectiondata )

  var sizeforwhitelist = []
  selectiondata.forEach(d=>{
    sizeforwhitelist.push(d.value)
  })

  //1.c make bold/italic/underline/strike buttons
  // prepare a list of elements (<button>)
  var selectiondata=[
    {attrs:[
      {attr:'class', value:'ql-bold'}
    ]},
    {attrs:[
      {attr:'class', value:'ql-italic'}
    ]},
    {attrs:[
      {attr:'class', value:'ql-underline'}
    ]},
    {attrs:[
      {attr:'class', value:'ql-strike'}
    ]}
  ]
  var tagname='button'
  makeqlelms(qltoolbarbox,selectiondata,tagname)

  /** 1.d make default selectors (for font color, and for highlight background color)
   * Note: unlike in example 2 (see anInteractiveQuillApp() in learning.js), here we'll use
   *  default options for font / highlight background color setting. i.e., there is no need to 
   *  set the selectiondata for each color option. 
   * Also, to use the default selector, do not specify the vars for like:
   *  var BackgroundClass = Quill.import('attributors/class/background');
   * Neither to register the BackgroundClass like:
   *  Quill.register(BackgroundClass, true); 
   * 
   * */

  // prepare a list of elements (<select>) 
  var selectiondata=[
    {attrs:[
      {attr:'class', value:'ql-color'}
    ]},
    {attrs:[
      {attr:'class', value:'ql-background'}
    ]}
  ]
  var tagname='select'
  makeqlelms(qltoolbarbox,selectiondata,tagname)

 //1.e make blockquote/codeblock/hyperlink buttons
  // prepare a list of elements (<button>)
  var selectiondata=[
    {attrs:[
      {attr:'class', value:'ql-blockquote'}
    ]},
    {attrs:[
      {attr:'class', value:'ql-code-block'}
    ]},
    {attrs:[
      {attr:'class', value:'ql-link'}
    ]},
    {attrs:[
      {attr:'class', value:'ql-image'}
    ]},
    {attrs:[
      {attr:'class', value:'ql-video'}
    ]},
    /** 
     * The following is a cool tool for formulas
     * To enable it, add lines in the html to specify style and js links to Katex
     * https://katex.org/docs/browser.html
     * 
     * Katex uses TeX/LaTeX expressions, which can be found at:
     * https://en.wikibooks.org/wiki/LaTeX/Mathematics
     * Example of logistic regression:
     * outcome = \beta_{0} + \beta_{1} \text{Gender} + \epsilon
     * 
     * \frac{\exp(\beta_{0} + \beta_{1} \text{Gender} + \beta_{2} \text{Age} + \dots +     
     * \beta_{12} \text{immigration)} }{1 + \exp(\beta_{0} + \beta_{1} \text{Gender} + 
     * \beta_{2} \text{Age} + \dots + \beta_{12 }\text{immigration})}
    */
    {attrs:[
      {attr:'class', value:'ql-formula'}
    ]}
  ]
  var tagname='button'
  makeqlelms(qltoolbarbox,selectiondata,tagname)

  //1.f make buttons for bullets and indentation
  // prepare a list of elements (<button>)
  var selectiondata=[
    {attrs:[
        {attr:'class', value:'ql-list'},
        {attr:'value', value:'ordered'}
      ]},
    {attrs:[
        {attr:'class', value:'ql-list'},
        {attr:'value', value:'bullet'}
      ]},
    {attrs:[
        {attr:'class', value:'ql-indent'},
        {attr:'value', value:'-1'}
      ]},
    {attrs:[
        {attr:'class', value:'ql-indent'},
        {attr:'value', value:'+1'}
      ]}
  ]
  var tagname='button'
  makeqlelms(qltoolbarbox,selectiondata,tagname)

  //1.g text direction (from left, from right)
  var selectiondata=[
    {attrs:[
      {attr:'class', value:'ql-direction'},
      {attr:'value', value:'rtl'}
    ]}
  ]
  var tagname='button'
  makeqlelms(qltoolbarbox,selectiondata,tagname)

  //1.h text alignment (left, right, center, justify)
  var selectiondata=[
    {attrs:[
      {attr:'class', value:'ql-align'}
    ]}
  ]
  var tagname='select'
  makeqlelms(qltoolbarbox,selectiondata,tagname)

  //1.i superscript/subscript (Note!!! do not change the order of sub/super. The order is fixed)
  var selectiondata=[
    {attrs:[
      {attr:'class', value:'ql-script'},
      {attr:'value', value:'sub'}
    ]},
    {attrs:[
      {attr:'class', value:'ql-script'},
      {attr:'value', value:'super'}
    ]}
  ]
  var tagname='button'
  makeqlelms(qltoolbarbox,selectiondata,tagname)

  //1.j clean text formating
  var selectiondata=[
    {attrs:[
      {attr:'class', value:'ql-clean'}
    ]}
  ]
  var tagname='button'
  makeqlelms(qltoolbarbox,selectiondata,tagname)


  //2. create an editor container
  var qledictorbox = d3.select(parentBodyDom).append('div').attr('id', id_editorbox)

  // //3. registor and make the quill app

  // // Add fonts to whitelist
  // We do not add Roboto since it is the default (the order of fonts in the white list does not matter)
  // Font.whitelist = ['appleultralight','helvetica', 'inconsolata', 'roboto', 'mirza', 'arial']; // must have!!! otherwise the dropdown list of fonts is displayed, but won't work.
  var Font = Quill.import('formats/font');
  Font.whitelist = fontsforwhitelist;
  Quill.register(Font, true);
  
  // var BackgroundClass = Quill.import('attributors/class/background'); // no need to set bkgroundclass if to use default backgound color options
  // var ColorClass = Quill.import('attributors/class/color'); // same as above
  
  var SizeStyle = Quill.import('attributors/style/size');
  SizeStyle.whitelist = sizeforwhitelist;
  Quill.register(SizeStyle, true);

  // Quill.register(BackgroundClass, true); // when using default setting of background classes, do not register it
  // Quill.register(ColorClass, true); // when using default setting for font color, do not register it
  // var options={
  //   modules: {
  //     toolbar: '#toolbar-container'
  //   },
  //   placeholder: 'The is the default text...',
  //   theme: 'snow'
  // } 

  // var quill = new Quill('#editor-container', options);

} // End makequill()





  // make a makeqlelms (e.g., for buttons like bold, italic, etc; for select tags like ql-color, ql-background)
  function makeqlelms(theqltoolbox, selectiondata, tagname){
  
    //1.a add ql selector
    var theqlelmholder=theqltoolbox.append('span').attr('class', 'ql-formats')
  
    //1.b add options into the selector in a batch, link options to the data elements in the selectiondata obj 
    var theElms = theqlelmholder.selectAll(tagname)
      .data(selectiondata) // data must be specified before enter()
      .enter()
      .append(tagname)
    ;
    //1.c set attr for each option
    theElms
      .attrs(function(d){
        /**
         * d is like:
         * {attrs:[
         *          {attr:'class', value:'ql-list'},
                    {attr:'value', value:'ordered'}
                    ],
            text:'text'
            },
         * */
        var result={}
        /**the result should be like
         * {
         *  'class': 'ql-list',
         *  'value': 'ordered'
         * }
         **/ 
        d.attrs.forEach(e=>{
          /**e is like {attr:'class', value:'ql-list'} */
          var key = e.attr
          result[key] = e.value 
            // this will make result.class = 'ql-list', and result.value = 'ordered'
            // i.e., it'll be equivalent to {'class': 'ql-list', 'value': 'ordered'} 
        })
        return result
      });

    //1.d set text for each option
    theElms
      .text(function(d){
          if(d.text !== null && d.text !== undefined){
            return d.text            
          }
      })

  } //end of makeqlelms
//make a modal for adding a new node, rename a node, and...
function makemodal(id, title, label, action){
    /**1.make a background
        this is to add a halfly transparent div on top of the current page. 
        It is to make a 'dim' effect of the whole page
    */ 
    var modalbackground = d3body
        .append('div')
        .attrs({'id': id, 'class': 'myModal'}) // id (e.g., theModal)
    
    /**2. within the background, create a dialog box 
     *  this is a box of the whole dialog area
    */
    var modaldialogbox = modalbackground.append('div').attrs({'class': 'modal-content'}) // this is a box of the whole dialog area

    /**3a. within the dialog box, create a header div */
    var modalheader=modaldialogbox.append('div').attrs({'class': 'modal-header'})

        /**3a.1 within the header, create a span as the modal close button*/
        var modalclosebutton=modalheader.append('span').attrs({'class': 'close', 'id':'ModalClose'} ).html('x')
        /**3a.2 within the header, create a h2 as the modal title*/
        var modalboxtitle=modalheader.append('h2').html(title) // modal header title ('e.g, Append a new node)

    /**3b. within the dialog box, create the body div */
    var modalbody = modaldialogbox.append('div').attrs({'class': 'modal-body'}) 

        /**3b1. within the body box, create the body title h2 */
        // var modalbodytitle = modalbody.append('h2').attrs({'id': 'modalTitle'}).html('Create Node')  // modal body title

        /**3b2. within the body box, create a div to hold rows that appears in the body */
        var modalbodyrow = modalbody.append('div').attrs({'class': 'row'})

        /**3b2a. within the body row div, create a div to hold body row contents */
        var modalbodyrowcontents = modalbodyrow.append('div').attrs({'class': 'large-12 columns'})

            /**3b2a1. within the body row contents div, create a label to indicate 'Node name' */
            var modalbodyrowcontentslabel = modalbodyrowcontents.append('label').text(label)  // prompt str, e.g 'Node name'
                /**3b2a1a. within the body row contents label, create an input DOM element to indicate 'Node name' */
                var modalbodyrowcontentslabelinput = modalbodyrowcontentslabel.append('input')
                    .attrs({'type':'text','class':'inputName', 'id':'ModalInput'}) //CreateNodeName
                    .styles({'placehoder':'node name', 'width':'80%'})
                /**3b2a1b. within the body row contents label, create a button to submit input */
                var modalbodyrowcontentslabelbutton = modalbodyrowcontentslabel.append('button')
                    .attrs({'onclick':action}) // e.g.,'createNode()' 
                    .text('OK')    
}




    
        
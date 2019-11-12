
var text = `

%let path=1;
libname path 1;
file a=1;



/*VXB, get all encounter episodes, indicated by whether or not being CME, 
and type of provider (PCP, SCP, OTH)*/ /* the sendond line*/

/*This is a
	multilinecomments
	with tabs
	with starting semicolon;
		;
  ;
	;
		with '	and whitespaces  
	" xxx

	'
	"
    */
data _null_;  rUn   ;

/*1. MSB claims of patients in the cohort*/
%VbsUnzip(
        tgtDir=,
        zipFile=%str(&localTargetPath.\vxa.zip),
        srcFile=%str(vxa.sas7bdat)
    );    

    %sqljoinv2(
        t1= clean18.alldin_4_jas18_15oct2018,
        t2=_tmp4,
        target=remoteT.ohdins,
        vars=t1.*,
        distinct=1,
        jvars=DIN,
        jtype=inner
    );

%* this is a singleline comment 1 with pct sign;
* another singleline comment without pct sign;

dAta vxb2;
    set vxb1;
    z = "b
    bb";
    x= 'a"bbb"';
    y = "ccc 'ddd' "; /*this is a multiline comment within a code block*/
    where
        num_srv ne 0
        and 
        LOS NOT in ('B
            ','2',"K","
            9")
        and 
        MODE ne 'Z'  
    ; * this is a single line comment without pct within a code block;
rUn;
datA vxb3;
        set vxb2;
    run;quit;

prOc sql;
    create table xxx as
    select 
        '/*not a multiple line comment
            */' as a, 
        '%*
            not a single linecomment
                ;' as b,
        '*
        not a single linecomment
                ;' as c,
    from yyy; 
run;qUit  \t ;

title "/*try me, not a comment yay!!!*/";
pRoc genmode; %* this is a single line comment with pct within a code block;
qUit 
  ;run;

`
// use this function as I want to store the replaced strings (each of different contents) in order and in an array so that they can be restored
function PickupMatched(srcobj, theRegEx, replacedkeyTemplate){
    // the srcobj must have .origin, .replaced, and .replacements
    if ( srcobj.replaced.match(theRegEx)!== null) {
        var theMatched =   srcobj.replaced.match(theRegEx)[0];
        var replacedIndex = srcobj.replacements.length ;
        var replacement={}
        replacement.key = '___' + replacedIndex + '_' + replacedkeyTemplate  + '___';
        replacement.value = theMatched;
        // console.log(replacement)
        srcobj.replacements.push(replacement)
        // console.log('the replacements ===============')
        // console.log(srcobj.replacements)
        var resultText = srcobj.replaced.replace(theRegEx, replacement.key)
        srcobj.replaced = resultText

        //now the recursive part
        if(srcobj.replaced.match(theRegEx)!== null ){
            // console.log('recursively run PickupMatched')
            srcobj=PickupMatched(srcobj, theRegEx, replacedkeyTemplate)
        }
    }    
    return srcobj
} // end PickupMatched
    
function codeToObj(theCodeText){

    // the src string is put into an obj, from this point, the rest are worked in that obj
    var initobj ={}
    initobj.origin = theCodeText;
    initobj.replaced=initobj.origin;
    initobj.replacements=[];

    // Note: must strictly follow the steps in order!!!

    //1. use the PickupMatched to extract multiple line comments an array
    //Note!!! do not use /gm, otherwise all of the matched strings will be replaced at the same time
    // Which is not what we want here. We want each mached string to be saved as different elements in .replacements
    var betweenmultilinecomments = /\/\*[\s\S]*?\*\//; //i.e., start with '/*', both escaped by \, and end with (?) '*/', also both escaped. in between, ([]), any length (*),not escaped, of white space chars (\s) and non-white space chars (\S)
    initobj = PickupMatched(initobj, betweenmultilinecomments, 'multilinecomments0824')

    //2. use the PickupMatched to extract single line comments start with %*
    var betweensinglelinecomments1 = /%\*[^(\r|\n|\r\n)]*?;/  ; // start with %*, end with ;, no line breakers in between (must be in a single line)
    initobj = PickupMatched(initobj, betweensinglelinecomments1, 'singlelinecomments10824')

    //3. use the PickupMatched to extract single line comments start with *
    /**Note!!! must use ?= instead of ?  
     * ? alone matches content between * and ;, even if they are in multiple lines. This is not correct
     * ?= instead matches content between * and ;, only for those IN the SAME LINE! 
    */
    var betweensinglelinecomments2 = /\*[^(\r|\n|\r\n)]*?;/;
    initobj = PickupMatched(initobj, betweensinglelinecomments2, 'singlelinecomments210824')

    //contents in quotes and apostrophes must be extacted first. The rules to identify comments does not apply to these contents
    //4. use the PickupMatched to extract contents between double quotes into an array
    var regex_betweenQuotes= /"([^"]*)"/
    initobj = PickupMatched(initobj, regex_betweenQuotes, 'quotes0824')


    //5. use the PickupMatched to extract contents between apostrophes into an array
    var regex_betweenApostrophes =/'([^']*)'/ 
    initobj = PickupMatched(initobj, regex_betweenApostrophes, 'apostrophes0824')


    //6. clean up whitespaces and line breakers between run and ; 
    //Note !!! Must be before step 8-11
    // console.log(console.log(text9.match(/run[ \t(\n|\r|\r\n)]*;/gmi)) // between run and ; (case insensitive), only contains white space or line breakers
    initobj.replaced=initobj.replaced.replace(/run[ \t(\n|\r|\r\n)]*;/gmi, 'run;') // for directly replacing all matched strings, it is ok to use the opiton /g

    //7. clean up whitespaces and line breakers between quit and ;
    //Note !!! Must be before step 8-11
    initobj.replaced=initobj.replaced.replace(/quit[ \t(\n|\r|\r\n)]*;/gmi, 'quit;')

    //8 clean up whitespaces between ; and link break 
    var re = /;[ \t]*\n/gmi
    initobj.replaced=initobj.replaced.replace(re, ';\n')

    //8. replace line breakers with br
    // rtext1 = initobj.replaced.replace(/\n/gm, '<br/>')
    initobj.replaced = initobj.replaced.replace(/\n/gm, '<br/>')


    //9. replace tab with nbsp
    // rtext2 = rtext1.replace(/\t/gm,'&nbsp&nbsp&nbsp&nbsp')
    initobj.replaced = initobj.replaced.replace(/\t/gm,'&nbsp&nbsp&nbsp&nbsp')

    //Note: !!! semicolons must be replaced after extracting single line comments. Otherwise the single line comments cannot be identified
    //10. replace semicolons with &#59 // Must having!!! otherwise for lines starting with whitespaces followed by a ';' (like '    ;' ), the ';' will be erased by this step!
    initobj.replaced = initobj.replaced.replace(/;/g, '&#59')    

    //11. replace white space with nbsp. It has to be after step8. Otherwise some semicolons will be erased
    var wtsp = /( )/g
    initobj.replaced=initobj.replaced.replace(wtsp, '&nbsp');

    //12 replace the datasteps
    regex_datasteps= /data&nbsp([\s\S])*?run&#59/i;
    initobj = PickupMatched(initobj, regex_datasteps, 'datasteps0824')
    //add a semicolon at the end of the datastep objs
    initobj.replaced = initobj.replaced.replace(/_datasteps0824___/gmi, '_datasteps0824___&#59')
 

    //13 things between proc and quit are a block
    regex_procs= /proc&nbsp([\s\S])*?quit&#59/i;
    initobj = PickupMatched(initobj, regex_procs, 'procs0824')
    //add a semicolon at the end of the datastep objs
    initobj.replaced = initobj.replaced.replace(/_procs0824___/gmi, '_procs0824___&#59')

    //finally replace content between ; and  <br/> as blocks
    initobj.blocks = initobj.replaced.split(/&#59<br\/><br\/>/m)

    return initobj;

} // end codeToObj()

var targetobj= codeToObj(text)

var thehtml='';
targetobj.blocks.forEach(d=>{
    thehtml =thehtml + d + '&#59<br/>======================================<br/>'
})

d3.select('body').append('div').html(thehtml).styles({'font-size': '30px','font-family': "Consolas" })
console.log(targetobj)


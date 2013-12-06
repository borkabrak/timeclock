/*
 * Timeclock
 */

/* Pad a string with leading characters */
String.prototype.lpad = function(len,chr){ 
  //(len,chr) = length to pad to, character to pad with (default '0')
  if (chr == undefined) { chr='0'; };
  var paddedstr = this;
  for (var i=0; i < (len - this.length);i++){
    paddedstr = chr + paddedstr;
  }
  return paddedstr;
}

/* Input: milliseconds.  Output: minutes:second (i.e., '03:43') */
Date.format = function(timespan){ //timespan should be milliseconds 

  //Let's limit our resolution to seconds instead of milliseconds
  // (It can help debugging to comment this, since it 'speeds up time' by 1000
  timespan = Math.floor(timespan / 1000);

  // 'mm:ss' 
  // return Math.floor(timespan / 60).toString().lpad(2) + ":" + (timespan % 60).toString().lpad(2); 

  // 'x min, y sec'
  return Math.floor(timespan / 60).toString() + " min, " + (timespan % 60).toString() + " sec"; 

}

/* Functions that affect the display */
Display = {

  update: function(p){
    /* 
     * Rebuild the entire display,
     * based on the array of clock times
     */

    var display = $("#display")[0];
    display.innerHTML = "";
    var workstate = $("#workstate")[0];

    // Update working state 
    $(workstate).removeClass();
    if (clock.working) {
      $(workstate).addClass("on");
      $(workstate)[0].innerHTML = "WORKING";
    } else {
      $(workstate).addClass("off");
      $(workstate)[0].innerHTML = "NOT WORKING";
    };

    // First line..
    var worktime = 0; // Accumulator for worked time
    var breaktime = 0; // Accumulator for time off
    var active = 0; // boolean - are we currently tracking worktime (true) or breaktime (false)?
    var lastpunch = p[0]; 

    // For each time the clock is punched..

    for(i=0;i<p.length;i++){

      var span = p[i] - lastpunch; // time in milliseconds since last punch

      if (!active) {

        breaktime += span;

        $("#totals #break")[0].innerHTML = Date.format(breaktime);

        if (span) {

          //display.innerHTML += "<br />" + "[Break: " + Date.format(span) + "]";
          
        }

          display.innerHTML += p[i].toLocaleTimeString() + " - ";

        active = 1;

      } else {

        worktime += span;

        $("#totals #work")[0].innerHTML = Date.format(worktime);

        display.innerHTML += p[i].toLocaleTimeString()
          + " <strong>[ " + Date.format(span) + " ]</strong><hr />" 
        active = 0;

      };

      lastpunch = p[i];
    }

    $("#readouts").slideDown();
    
    // Scroll to bottom
    display.scrollTop = display.scrollHeight;
  }

}

clock = {

  working: 0,  // Working state.  1: working, 0: not working

  punches: [], // Array of Date objects

  now: function(){
    return new Date.getTime();
  },

  start: function(){
    if (!clock.clear()) { return };
    clock.punch();

  },

  punch: function (){

    //toggle working state
    clock.working = clock.working?0:1;
    clock.punches.push(new Date());
    
    $("#readouts").slideUp(function(){Display.update(clock.punches)});

  },

  clear: function(){
    // Confirm before clearing display
    if ( $("#display")[0].innerHTML && !confirm("Forget everything and reset clock?") ) { return false };
    clock.working = 0;
    clock.punches = []
    $("#readouts").slideUp(function(){
      $("#totals #work")[0].innerHTML = Date.format(0);
      $("#totals #break")[0].innerHTML = Date.format(0);
      Display.update(clock.punches)
    });
    return true;
  }

};


/* This is called when body.load fires */
function initialize(){

  $("#readouts").hide();

  // Set hotkeys
  $("body").keypress(
    function(e){
      switch (e.which) {

        // Shift-C clears the clock
        case 67: 
          clock.clear();
          break;

        // Enter or space punch the clock
        case 13:
        case 32:
          clock.punch();
          break;

        // 'i' toggles instructions
        case 105:
          $("#instructions-header").click();
          break;

        default:
          //console.log("unrecognized key: " + e.keyCode);
      }
    }
  );

  $("#instructions-header").toggle(
    function(){
      $("#instructions-list").slideDown()
    },
    function(){
      $("#instructions-list").slideUp()
    }
  );
  $("#instructions-list").hide();

}

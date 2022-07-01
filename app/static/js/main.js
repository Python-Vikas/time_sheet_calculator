$(document).ready(function(){
  $('.break_checkbox').click(function(){
    if($(this).is(':checked') == true)
    {
      $(this).siblings('.break_start').removeAttr('disabled');
      $(this).siblings('.break_end').removeAttr('disabled');
    }
    else
    {
      $(this).siblings('.break_start').attr('disabled' , '');
      $(this).siblings('.break_end').attr('disabled' , '');
    }
  })





  const weekDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    $('#datePicker').datepicker({
      showAnim: 'fadeIn',
      dateFormat: "dd/mm/yy",
      firstDay: 1,
      beforeShowDay: function(date) {
        return [date.getDay() == 1,""];
      },
      onSelect: populateDates
    });

    function populateDates() {
      
      $('#tBody').empty(); //clear table
      $('.bottom').removeClass('d-none'); //display total hours worked
      let chosenDate = $('#datePicker').datepicker('getDate'); //get chosen date from datepicker
      let newDate;
      const monStartWeekDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
      for(let i = 0; i < weekDays.length; i++) { //iterate through each weekday
        newDate = new Date(chosenDate); //create date object
        newDate.setDate(chosenDate.getDate() + i); //increment set date



        $('#tBody').append( `
        <tr>
        <td class="day_date_data text-start">${weekDays[newDate.getDay()].slice(0,3)} <span class="date_mention">${newDate.getDate()}/${newDate.getMonth() + 1}/${newDate.getFullYear()}</span></td>
        <td><input type="time" id="startTime${monStartWeekDays[i]}" class="form-control timepicker time_in" name="" /></td>

        <td><p class="d-flex align-items-center mb-0"><input class="form-check-input break_checkbox noshadow_focus me-2" id="breakCheck${monStartWeekDays[i]}" type="checkbox" value=""><input type="time" id="startBreak${monStartWeekDays[i]}" class="form-control timepicker break_start" name="" disabled /></p></td>

        <td><input type="time" id="breakEnd${monStartWeekDays[i]}" class="form-control timepicker break_start" name="" disabled /></td>

        

        <td><input type="time" id="finishTime${monStartWeekDays[i]}" class="form-control timepicker time_out" name=""/></td>

        <td><input type="time" id="timeOff${monStartWeekDays[i]}" class="form-control timepicker time_off" name=""/></td>

        <td id="tdComment${monStartWeekDays[i]}"><input type="text" id="comment${monStartWeekDays[i]}" class="form-control timepicker time_off" name=""/></td>

        <td class="hours-worked" id="hoursWorked${monStartWeekDays[i]}">
            0
        </td>
        
        <td id='copy_checkbox'><input id="copyCheck${monStartWeekDays[i]}" class="form-check-input copy_checkbox noshadow_focus me-2" type="checkbox" value="" checked /></td>
        <td class="copy_td"></td>
        
        </tr>

        ` );

        //function to calculate hours worked
        function calculateHours() {
          let startVal = $(`#startTime${monStartWeekDays[i]}`).val();
          let finishVal = $(`#finishTime${monStartWeekDays[i]}`).val();
          let startBreak = $(`#startBreak${monStartWeekDays[i]}`).val();
          let endBreak = $(`#breakEnd${monStartWeekDays[i]}`).val();

          var id = $(this).attr("id");
          
          
          if(id === `finishTime${monStartWeekDays[i]}`){
            if(checkTimeDiff(startVal, finishVal) < 0){
              errorMessage(`finishTime${monStartWeekDays[i]}`, 'Past Time not allowed')
              return
            }
          }

          if(id === `startBreak${monStartWeekDays[i]}`){
            if(startVal == ''){
              errorMessage(`startBreak${monStartWeekDays[i]}`, 'Please Select Time IN first')
              $(`#startBreak${monStartWeekDays[i]}`).attr('disabled','disabled');
              $(`#breakEnd${monStartWeekDays[i]}`).attr('disabled','disabled');
              $(`#breakCheck${monStartWeekDays[i]}`).prop('checked', false).change();
              return
            }else{
              if(checkTimeDiff(startVal, startBreak) < 0){
                errorMessage(`startBreak${monStartWeekDays[i]}`, "Start Break Time can't be before Start Work time")
                return
              }
            }
          }
          if(id === `breakEnd${monStartWeekDays[i]}`){
            if(checkTimeDiff(startBreak, endBreak) < 0){
              errorMessage(`breakEnd${monStartWeekDays[i]}`, "End Break Time can't be before Start Break time")
              return
            }
          }

          if(id === `finishTime${monStartWeekDays[i]}`){
            if($(`#breakCheck${monStartWeekDays[i]}`).prop('checked') == true){
              if(checkTimeDiff(startBreak, finishVal) < 0){
                errorMessage(`finishTime${monStartWeekDays[i]}`, "Time out can't be before End break")
                return
              }
            }else{
              if(checkTimeDiff(startVal, finishVal) < 0){
                errorMessage(`finishTime${monStartWeekDays[i]}`, "Time out can't be before Start Time")
                return
              }
            }
          }


          

          
          let startBreakTime = new Date( `01/01/2007 ${startBreak}` );
          let endBreakTime = new Date( `01/01/2007 ${endBreak}` );
          let breakTime = ((endBreakTime.getTime() - startBreakTime.getTime()) / 1000);

          let startTime = new Date( `01/01/2007 ${startVal}` );
          let finishTime = new Date( `01/01/2007 ${finishVal}` );

          let hoursWorked = ((finishTime.getTime() - startTime.getTime()) / 1000);
          let totalWorkHours = (((hoursWorked - breakTime)));
          totalWorkHours /= (60 * 60);

          

          if (startVal && finishVal) { //providing both start and finish times are set
            if (hoursWorked >= 0) { //if normal day shift
              $(`#hoursWorked${monStartWeekDays[i]}`).html(totalWorkHours);
            } else { //if night shift
              $(`#hoursWorked${monStartWeekDays[i]}`).html(24 + totalWorkHours);
            }
          }


          let copy_start_time = $(`#startTimeMonday`).val();
          let copy_end_time = $(`#finishTimeMonday`).val();
          if(copy_start_time !== null && copy_start_time !== '' && copy_start_time !== undefined && copy_end_time !== null && copy_end_time !== '' && copy_end_time !== undefined){
            $(`#copyMonday`).prop('disabled', false);
          }

          updateTotal();
        }

        const breakCheckboxClick = () => {
          if($(`#breakCheck${monStartWeekDays[i]}`).prop('checked') == true){
            $(`#startBreak${monStartWeekDays[i]}`).removeAttr("disabled");
            $(`#breakEnd${monStartWeekDays[i]}`).removeAttr("disabled");
            $(`#comment${monStartWeekDays[i]}`).remove();

          }else{
            $(`#startBreak${monStartWeekDays[i]}`).attr('disabled','disabled');
            $(`#breakEnd${monStartWeekDays[i]}`).attr('disabled','disabled');
            $(`#tdComment${monStartWeekDays[i]}`).append(`<input type="text" id="comment${monStartWeekDays[i]}" class="form-control timepicker time_off" name=""/>`);

            if($(`#startBreak${monStartWeekDays[i]}`).val() !== ''){
              
              $(`#startBreak${monStartWeekDays[i]}`).val("").change()
              $(`#breakEnd${monStartWeekDays[i]}`).val("").change()
            }
            
          }
        }



        //initiate function whenever an input value is changed
        $(`#startTime${monStartWeekDays[i]}, #finishTime${monStartWeekDays[i]}, #startBreak${monStartWeekDays[i]}, #breakEnd${monStartWeekDays[i]}`).on('change', calculateHours);

        $(`#breakCheck${monStartWeekDays[i]}`).on('click', breakCheckboxClick);
        

      }
      $('#tBody tr:first-child .copy_td').append(`<button id="copyMonday" class="copy_btn" disabled>Copy</button>`);

      $('#tBody tr:first-child #copy_checkbox').remove();

      $('.start-time input').timepicker({ 'timeFormat': 'H:i', 'step': 15, 'scrollDefault': '09:00' });
      $('.finish-time input').timepicker({ 'timeFormat': 'H:i', 'step': 15, 'scrollDefault': '17:00' });

     

      function updateTotal() { //function to update the total hours worked
        let totalHoursWorked = 0;
        let hrs = document.querySelectorAll('.hours-worked');
        hrs.forEach(function(val) {
          totalHoursWorked += Number(val.innerHTML);
        });
        document.querySelector('#totalHours').innerHTML = totalHoursWorked.toFixed(2);
      }
      
    }

    function checkTimeDiff(time1, time2){
      let startBreakTime = new Date( `01/01/2007 ${time1}` );
      let endBreakTime = new Date( `01/01/2007 ${time2}` );
      let diff = ((endBreakTime.getTime() - startBreakTime.getTime()) / 1000)/60;
      return diff
    }

    function errorMessage(id, mesg){
      $('#message').append(`<p id='pmesg'>${mesg}</p>`)
      $(`#${id}`).val('')
      setTimeout(function(){
        $('#pmesg').remove()
      },3000)
    }

    $(document).on('click', '#copyMonday', function(){ 
      let startVal = $(`#startTimeMonday`).val();       // console.log(startVal)
      let finishVal = $(`#finishTimeMonday`).val();
      let startBreak = $(`#startBreakMonday`).val();
      let endBreak = $(`#breakEndMonday`).val();
      let comment = $(`#commentMonday`).val();
      let timeOff = $(`#timeOffMonday`).val();
      

      weekDays.forEach(data => {
        console.log(data)
        if(data !== 'Monday'){
          
          if($(`#copyCheck${data}`).prop('checked') == true){
            $(`#startTime${data}`).val(startVal).change();
            $(`#finishTime${data}`).val(finishVal).change();
            $(`#comment${data}`).val(comment).change();
            $(`#timeOff${data}`).val(timeOff).change();


            $(`#startBreak${data}`).val(startBreak).change();
            $(`#breakEnd${data}`).val(endBreak).change();

            if($(`#breakCheckMonday`).prop('checked') == true){
              $(`#breakCheck${data}`).prop('checked', true).change();
              $(`#startBreak${data}`).prop("disabled", false);
              $(`#breakEnd${data}`).prop("disabled", false);
              $(`#comment${data}`).remove();
            }
            
          }
        }
      })

    });

})


function tableToCSV() {
  var csv_data = [];
  var table_div = document.getElementById('tome_sheet_table')
  var rows = table_div.getElementsByTagName('tr');
  for (var i = 0; i < rows.length; i++) {
      var cols = rows[i].querySelectorAll('td,th');
      var csvrow = [];
      for (var j = 0; j < cols.length; j++) {
        
        if(isHTML(cols[j].innerHTML)){
          try{
            if($(cols[j].innerHTML).is('input')){
              let id = getInputBoxId(cols[j].innerHTML)
              id = id.slice(1, -1)
              let value = $(`#${id}`).val()
              if( value !== '&nbsp'){
              csvrow.push(value);
              }
            }else if($(cols[j].innerHTML).is('p')){
              let id = getBreakStartInputBoxId(cols[j].innerHTML)
              id = id.slice(1, -1)
              let value = $(`#${id}`).val()
              if( value !== '&nbsp'){
                csvrow.push(value);
                }
            }
          }catch(err){
            console.log("errorr", err)
            let string = extractContent(cols[j].innerHTML)
            if( string !== '&nbsp'){
              csvrow.push(string);
              }
          }
        }else{
          csvrow.push(cols[j].innerHTML);
        }
      }

      csv_data.push(csvrow.join(","));
  }
  csv_data = csv_data.join('\n');
  downloadCSVFile(csv_data)
}





function downloadCSVFile(csv_data) {
  CSVFile = new Blob([csv_data], { type: "text/csv" });
  var temp_link = document.createElement('a');
  temp_link.download = "timeSheet.csv";
  var url = window.URL.createObjectURL(CSVFile);
  temp_link.href = url;
  temp_link.style.display = "none";
  document.body.appendChild(temp_link);
  temp_link.click();
  document.body.removeChild(temp_link);
}


function getInputBoxId(str){
  let b = str.split("id=")
  b = b[1].split(" ")
  return b[0]
 }
 
 function getBreakStartInputBoxId(str){
    let b = str.split('type="time"')
    b = b[1].split("id=")
    let c = b[1].split(" ")
    return c[0]
  }
 
 
 function isHTML(str) {
   var a = document.createElement('div');
   a.innerHTML = str;
   for (var c = a.childNodes, i = c.length; i--; ) {
     if (c[i].nodeType == 1) return true; 
   }
   return false;
 }
 
 function extractContent(s) {
   var span = document.createElement('span');
   span.innerHTML = s;
   return span.textContent || span.innerText;
 };
 
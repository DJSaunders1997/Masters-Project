<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta charset="utf-8">
    
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">
    <link rel="stylesheet" href="css/stylesheet.css" >
    <link rel="stylesheet" href="css/d3.css" >
    <!--JS Libs -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
    <script src="https://d3js.org/d3.v4.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/d3-legend/2.21.0/d3-legend.js"></script>
    <script src="js/numeric.min.js"></script>
    <script src="js/d3.legend.js"></script>
    <!--JS Own -->
    <script src="js/d3_compareOverviewGraph.js"></script>
    <script src="js/prepareForD3.js"></script>
    <script src="js/d3_overviewGraph.js"></script>
    <script src="js/d3_riskanalysis.js"></script>
    <script src="js/overviewDetails.js"></script>
    <script src="js/d3_detailGraph.js"></script>
    <script src="js/d3_detailGraphBarChart.js"></script>
    <script src="js/filters.js"></script>
    <script src="js/riskCurve.js"></script>    
    
    
    
  </head>
  <body onload="init()">
    <div class="container-fluid myContainer">
      <div class="row">
        <div class="col-md-5">
          <svg id="svg_overviewGraph" width="700" height="300"></svg>
          <svg id="svg_detailGraph" width="700" height="300"></svg>
          <svg id="svg_detailGraphBarChart" width="700" height="300"></svg>
          <svg id="svg_compareOverViewGraph" width="700" height="300"></svg>          
        </div>
        <div class="col-md-3" id="overviewDetails">              
          <!--<h2>Evaltool</h2>-->
      
          <h3 type="button" data-toggle="collapse" data-target="#filters" aria-expanded="false" aria-controls="collapseExample">Filters<h6> (click here to see Full)</h6></h3>
          <!-- Filter -->
          <div class="collapse" id="filters">
            <p id="countDataset"></p>
            <div class="filters gender">
              <p>Filter Gender</p>
              <div class="checkbox-inline"><label><input class="cb" type="checkbox" value="F" name="radio_gender" checked>Female</label></div>
              <div class="checkbox-inline"><label><input class="cb" type="checkbox" value="M" name="radio_gender" checked>Male</label></div>
            </div>
            <div class="filters invExp">
              <p>Filter Investment experience L/M/H</p>
              <div class="checkbox-inline"><label><input class="cb" type="checkbox" value="1" name="radio_invExp" checked>Low</label></div>
              <div class="checkbox-inline"><label><input class="cb" type="checkbox" value="2" name="radio_invExp" checked>Medium</label></div>
              <div class="checkbox-inline"><label><input class="cb" type="checkbox" value="3" name="radio_invExp" checked>High</label></div>
            </div>
            <div class="filters comExp">
              <p>Filter Computer experience L/M/H</p>
              <div class="checkbox-inline"><label><input class="cb" type="checkbox" value="1" name="radio_comExp" checked>Low</label></div>
              <div class="checkbox-inline"><label><input class="cb" type="checkbox" value="2" name="radio_comExp" checked>Medium</label></div>
              <div class="checkbox-inline"><label><input class="cb" type="checkbox" value="3" name="radio_comExp" checked>High</label></div>
            </div>
            <div class="filters ">
              <p>Filter Age</p>
              <div class="checkbox-inline"><label><input class="cb" type="checkbox" value="1" name="radio_age" checked>0 < 20</label></div>
              <div class="checkbox-inline"><label><input class="cb" type="checkbox" value="2" name="radio_age" checked>21 < 30</label></div>
              <div class="checkbox-inline"><label><input class="cb" type="checkbox" value="3" name="radio_age" checked>31+</label></div>
            </div>
            <div class="filters dataset">
              <p>Filter Dataset</p>
              <div id="listofInterfaces"></div>
            </div>
          </div>
          <div class="filters selectLB">
            <br>
            <p>Select between Line / Barchart</p>
            <div class="radio-inline"><label><input type="radio" value="l" name="radio_linebar">Line</label></div>
            <div class="radio-inline"><label><input type="radio" value="b" name="radio_linebar" checked>Bar</label></div>
          </div>
          <div class="details">
            <h3>Data Details</h3>
            <table>              
              <tbody class="tableDetails">  
                <tr><th> </th> <th><i>Clicked</i></th> <th><i>Act</i></th></tr>            
                <tr><td>Computer Experience:</td><td><i id="computerExperience"></i></td><td><i id="computerExperienceAct"></i></td></tr>
                <tr><td>Investement Experience:</td><td><i id="investmentExperience"></i></td><td><i id="investmentExperienceAct"></i></td></tr>
                <tr><td>Time to Complete[min]:</td><td><i id="timeToComplete"></i></td><td><i id="timeToCompleteAct"></i></td></tr>
              </tbody>
            </table>
              
            <div class="checkbox" id="toCompareCheckbox"><label><input type="checkbox" id="checkToCompare" />to Compare</label></div>
            <button class="btn btn-danger" id="deleteDataset">Delelte This Dataset</button>
          </div>
        </div>
        
        <div class="col-md-4">
          <h2>Risk Return Curve Analysis</h2>
          <table class="tableDetails "id="tbl_riskdot_mean"></table><br>
          <svg width="400" height="400" id="svg_riskanalysis"></svg>
          <div class="interests">
            <table class="tableDetails" id="tableDetailsglobal"></table>
          </div>
        </div>
      </div>
      <div class="tooltip" style="opacity:0"></div>
    </div>
  </body>
  
  <script>
  //globals
  var data=null, compare = [], filteredData= null, thisDataSet = null, thisData = [], color, colorLegend, x, di = [];
  
  //Filter detect changes
  $(document).on('click', '.cb', function(){
    $('#deleteDataset').hide();
    if(this.checked == true) {
      filterreset();      
      applycurrentFilters();
    }else {
      applyFilters($(this).attr("name"), $(this).val()); 
    }
    updategraphs();
  });
  function applycurrentFilters(){
    $( ":checkbox" ).each(function () {
        if (!this.checked) {
          applyFilters($(this).attr("name"), $(this).val());
        }
    });
  }
  
  //data load Func
  function init(){
    $.ajax({
      url: '../saves/readData.php',
      type: 'POST',
      data: { read : "getID" },
      success: function (result) {
        data = JSON.parse(result);
        filteredData = JSON.parse(result);
        init2();
      },
      error: function(d){
        console.log(d);
        alert("a error occurred");}
    });	
    ;
  }
  
  //Initalizing the system
  function init2(){
    $('#svg_detailGraphBarChart').show();
    $('#svg_detailGraph').hide();
    $('#toCompareCheckbox').hide();
    $('#deleteDataset').hide();
    
    //setting display width;
    var width = $( window ).width(),
        height = $( window ).height(),
        layoutwidth = [35,35,30],
        globalMarginWidth = 5,
        globalMarginHeight = 5;      // [%]
    
    var heights = [height*(1-(globalMarginHeight/100))*(33/100)]
    
    var widths = [width*(1-(globalMarginWidth/100))*(layoutwidth[0]/100),
                  width*(1-(globalMarginWidth/100))*(layoutwidth[1]/100),
                  width*(1-(globalMarginWidth/100))*(layoutwidth[2]/100)]
    
    $('.myContainer').attr('width', width*(1-(globalMarginWidth/100)));
    $('#svg_overviewGraph').attr("width", widths[0]).attr("height",heights[0]);
    $('#svg_detailGraph').attr("width", widths[0]).attr("height",heights[0]);
    $('#svg_detailGraphBarChart').attr("width", widths[0]).attr("height",heights[0]);
    $('#svg_compareOverViewGraph').attr("width", widths[0]).attr("height",heights[0]);
    $('#tableDetailsglobal').attr("width", widths[2]);
    $('#tbl_riskdot_mean').attr("width", widths[2]);
    color = d3.scaleOrdinal(d3.schemeCategory20);
    colorLegend =  d3.scaleOrdinal()
      .range(["#ff8c00", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]); 
    
    var selection = [];
    var pushstatus = false;
    for (i in data){   
      if(selection.length == 0) {selection.push(data[i]);}
      pushstatus = true;
      for (j in selection){
        if(data[i]["interface"] == selection[j]["interface"] && data[i]["dataset-type"] == selection[j]["dataset-type"]){
          pushstatus = false;          
        } 
      }    
      if(pushstatus) selection.push(data[i]);
    }
    
    for (k in selection){
      $('#listofInterfaces').append('<div class="checkbox"><label><input class="cb" type="checkbox" value="'+selection[k]["dataset-type"]+'-'+selection[k]["interface"]+'" name="radio_dataset" checked>'+selection[k]["dataset-type"]+' '+selection[k]["interface"]+'</label></div>');
    }
    
    var flags = [], l = filteredData.length, i;
    for( i=0; i<l; i++) {
        if( flags[filteredData[i]["interface"]]) continue;
        flags[filteredData[i]["interface"]] = true;
        di.push(filteredData[i]["interface"]);
    }
    // Distinct Code from http://stackoverflow.com/questions/15125920/how-to-get-distinct-values-from-an-array-of-objects-in-javascript
    
    //setup D3s
    updategraphs();
  }   
  
  //Update OverviewGraph and Rsk-Ret-Graph
  function updategraphs(){
    $('#svg_overviewGraph').html('');
    $('#svg_riskanalysis').html('');  
    $('#svg_detailGraph').html('');
    $('#svg_detailGraphBarChart').html('');
    
    
    prepareOverView(filteredData);
    riskAnalysisDots(calcRskRet(filteredData));
    computeOverallDetails(calcRskRet(filteredData));
  }
  
  //Update DetailsGraphs
  function updateDetailGraphs(d){
    $('#svg_detailGraph').html('');
    $('#svg_detailGraphBarChart').html('');
    $('#deleteDataset').show();
    computeDetails(d);
    prepareDetailsBar(d);
    prepareDetailsLine(d);
  }
    
    $('input[name="radio_linebar"]').change(function(){
      if( $('input[name="radio_linebar"]:checked').val() == "b") {
        $('#svg_detailGraph').hide();
        $('#svg_detailGraphBarChart').show();
      }else{
        $('#svg_detailGraph').show();
        $('#svg_detailGraphBarChart').hide();
      }
    });
    
    $('#checkToCompare').change(function (d) {
      if(this.checked){
        addDataSet(thisDataSet);
      }else {
        removeDataSet(thisDataSet);
      }
      $('#svg_compareOverViewGraph').html('');
      prepareCompareGraph();
    });
  
  $('#deleteDataset').click(function(d){
    $('#deleteDataset').hide();
    console.log(data.length)
    for (i in data){
      if(data[i].id == thisDataSet){
        data.splice(i, 1);
        break;
      }
    }
    
    for (i in compare){
      if(compare[i] == thisDataSet){
        compare.splice(i, 1);
        break;
      }
    }
    
    filteredData = JSON.parse(JSON.stringify(data));
    filterreset();
    applycurrentFilters();
    updategraphs(filteredData);
    $('#svg_compareOverViewGraph').html('');
    $('#toCompareCheckbox').hide();
    prepareCompareGraph();
  })
  </script>
  
</html>
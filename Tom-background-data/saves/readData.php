<?php
if(isset($_POST['read']) && !empty($_POST['read'])) {	
  $read = $_POST['read'];
  $lfd = 0;
  $myarray = array();
  if ($handle = opendir('.')) {
    while (false !== ($entry = readdir($handle))) {
      if ($entry != "." && $entry != "..") {
        $file_parts = pathinfo($entry);
        if ( $file_parts['extension'] == "json"){
          // if(substr( $entry, 0, strlen($read) ) === $read){
            $j = json_decode(file_get_contents($entry),true);
            if(! $j['demographics-age'] == null && $j['portfolio-1-remainingCash'] != null){
              if(substr( $entry, 0, 8 ) === "PreStudy"){
                  $dataset_type = "Prestudy";
                }else{
                  $dataset_type = "Mainstudy";
                }
                
              array_push($myarray, array(
                "demographics-age" =>intval(str_replace('"','',$j['demographics-age'])),
                "demographics-gender" =>str_replace('"','',$j['demographics-gender']),
                "demographics-computer-experience" =>intval(str_replace('"','',$j['demographics-computer_experience'])),
                "demographics-investment-experience" =>intval(str_replace('"','',$j['demographics-investment_experience'])),
                
                "portfolio-1-a1" =>doubleval(str_replace('"','',$j['portfolio-1-a1'])),
                "portfolio-1-a2" =>doubleval(str_replace('"','',$j['portfolio-1-a2'])),
                "portfolio-1-a3" =>doubleval(str_replace('"','',$j['portfolio-1-a3'])),
                "portfolio-1-a4" =>doubleval(str_replace('"','',$j['portfolio-1-a4'])),
                "portfolio-1-a5" =>doubleval(str_replace('"','',$j['portfolio-1-a5'])),
                "portfolio-1-remainingCash" =>doubleval(str_replace('"','',$j['portfolio-1-remainingCash'])),
                
                "portfolio-2-a1" =>doubleval(str_replace('"','',$j['portfolio-2-a1'])),
                "portfolio-2-a2" =>doubleval(str_replace('"','',$j['portfolio-2-a2'])),
                "portfolio-2-a3" =>doubleval(str_replace('"','',$j['portfolio-2-a3'])),
                "portfolio-2-a4" =>doubleval(str_replace('"','',$j['portfolio-2-a4'])),
                "portfolio-2-a5" =>doubleval(str_replace('"','',$j['portfolio-2-a5'])),
                "portfolio-2-remainingCash" =>doubleval(str_replace('"','',$j['portfolio-2-remainingCash'])),
                
                "portfolio-3-a1" =>doubleval(str_replace('"','',$j['portfolio-3-a1'])),
                "portfolio-3-a2" =>doubleval(str_replace('"','',$j['portfolio-3-a2'])),
                "portfolio-3-a3" =>doubleval(str_replace('"','',$j['portfolio-3-a3'])),
                "portfolio-3-a4" =>doubleval(str_replace('"','',$j['portfolio-3-a4'])),
                "portfolio-3-a5" =>doubleval(str_replace('"','',$j['portfolio-3-a5'])),
                "portfolio-3-remainingCash" =>doubleval(str_replace('"','',$j['portfolio-3-remainingCash'])),
                
                "portfolio-4-a1" =>doubleval(str_replace('"','',$j['portfolio-4-a1'])),
                "portfolio-4-a2" =>doubleval(str_replace('"','',$j['portfolio-4-a2'])),
                "portfolio-4-a3" =>doubleval(str_replace('"','',$j['portfolio-4-a3'])),
                "portfolio-4-a4" =>doubleval(str_replace('"','',$j['portfolio-4-a4'])),
                "portfolio-4-a5" =>doubleval(str_replace('"','',$j['portfolio-4-a5'])),
                "portfolio-4-remainingCash" =>doubleval(str_replace('"','',$j['portfolio-4-remainingCash'])),
                
                "portfolio-5-a1" =>doubleval(str_replace('"','',$j['portfolio-5-a1'])),
                "portfolio-5-a2" =>doubleval(str_replace('"','',$j['portfolio-5-a2'])),
                "portfolio-5-a3" =>doubleval(str_replace('"','',$j['portfolio-5-a3'])),
                "portfolio-5-a4" =>doubleval(str_replace('"','',$j['portfolio-5-a4'])),
                "portfolio-5-a5" =>doubleval(str_replace('"','',$j['portfolio-5-a5'])),
                "portfolio-5-remainingCash" =>doubleval(str_replace('"','',$j['portfolio-5-remainingCash'])),
                
                "timing-1-totalTime" => intval(str_replace('"','',$j['timing-1-totalTime'])),
                "timing-2-totalTime" => intval(str_replace('"','',$j['timing-2-totalTime'])),
                "timing-3-totalTime" => intval(str_replace('"','',$j['timing-3-totalTime'])),
                "timing-4-totalTime" => intval(str_replace('"','',$j['timing-4-totalTime'])),
                "timing-5-totalTime" => intval(str_replace('"','',$j['timing-5-totalTime'])),
                
                "dataset-type" => $dataset_type,
                "interface" => str_replace('"','',$j['demographics-interfaceName']),
                "id" => $lfd
              ));
              $lfd = $lfd +1;
            }
          }
        // }
      }   
    }
  }
  echo json_encode($myarray);
}    
  ?>
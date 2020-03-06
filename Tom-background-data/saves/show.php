<?php
$index = 1;
echo "hallo welt!!<br>";
echo "<table border='1'>";
if ($handle = opendir('.')) {
    while (false !== ($entry = readdir($handle))) {
        if ($entry != "." && $entry != "..") {
          $file_parts = pathinfo($entry);
           if ( $file_parts['extension'] == "json"){
              $json = json_decode(file_get_contents($entry),true);
              // hier muss de ausgabe hin
             // echo $entry." - " .number_format((float)str_replace('"','',$json['portfolio-2-a2']),2,'.', ''). "<br>";
            
            echo "<tr>";
            echo "<td>".$entry."</td>";
            echo '<td>'.$json['demographics-gender'].'</td>';
            echo '<td>'.$json['demographics-age'].'</td>';
            echo '<td>'.$json['demographics-computer_experience'].'</td>';
            echo '<td>'.$json['demographics-investment_experience'].'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-1-a1']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-1-a2']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-1-a3']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-1-a4']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-1-a5']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-1-remainingCash']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-2-a1']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-2-a2']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-2-a3']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-2-a4']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-2-a5']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-2-remainingCash']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-3-a1']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-3-a2']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-3-a3']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-3-a4']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-3-a5']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-3-remainingCash']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-4-a1']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-4-a2']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-4-a3']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-4-a4']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-4-a5']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-4-remainingCash']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-5-a1']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-5-a2']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-5-a3']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-5-a4']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-5-a5']),2,'.', '').'</td>';
              echo '<td>'.number_format((float)str_replace('"','',$json['portfolio-5-remainingCash']),2,'.', '').'</td>';

            echo "</tr>";
            
            $index = $index +1;
           }
        }
    }

    closedir($handle);
}
echo "</table>";
?>
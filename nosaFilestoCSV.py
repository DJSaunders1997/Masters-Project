import os
import json
import pandas as pd
from JSONtoCSV import list_JSON_dicts2string_np


all_mouseevents = []
directory_name = 'No-sa-Lab-Study-data'

for file in os.listdir(directory_name):

        with open(directory_name +'\\'+ file) as json_file:
                dict = json.load(json_file)

        if dict['mouseevents-events'] == None:
                print('################# {} contained no mouse data #################'.format(file))
                continue

        list_dicts = json.loads(dict['mouseevents-events'])     ## need a if = Null Then continue claus

        mouseevents_list = list_JSON_dicts2string_np(list_dicts)        #Use my prebuilt function

        all_mouseevents.extend(mouseevents_list)

dataframe = pd.DataFrame(mouseevents_list).rename(columns={0 : "button",
                                                                         1 : "event_type",
                                                                         2 : "target",
                                                                         3 : "time",
                                                                         4 : "x", 
                                                                         5 : "y", 
                                                                         6 : "step",
                                                                         7 : "turkId"})

dataframe.to_csv('Lab-Data-NoSa2.csv')
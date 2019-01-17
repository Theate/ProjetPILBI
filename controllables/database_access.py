#!/usr/bin/env python3

from influxdb import InfluxDBClient

class DBConnexion:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.client = InfluxDBClient(host=host, port=port)

    def get_state(self, controllable_system):
        self.client.switch_database('CONTROLLABLE_SYSTEMS')
        myquery = "SELECT last(value), id_station FROM %s GROUP BY id_station" % controllable_system
        result_set = self.client.query(myquery)
        return result_set

    def is_freeze(self):
        self.client.switch_database('CONTROLLABLE_SYSTEMS')
        myquery = "SELECT last(value) FROM freeze"
        result_set = self.client.query(myquery)
        for mypoint in result_set.get_points():
            return mypoint['last']

    def change_controllable_state(self, controllable_system, id_station, new_state):
        self.client.switch_database('CONTROLLABLE_SYSTEMS')
        myrequest = [{"measurement": controllable_system, "tags": {"id_station": id_station}, "fields": {"value": float(new_state)}}]
        self.client.write_points(myrequest)

    def get_list_systems(self):
        self.client.switch_database('CONTROLLABLE_SYSTEMS')
        result_set = self.client.query('SHOW MEASUREMENTS')
        output = []
        for point in result_set:
            for dict in point:
                measurement = dict['name']
                if measurement != "freeze":
                    output.append(measurement)
        return output

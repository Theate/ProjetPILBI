#!/usr/bin/env python3

from influxdb import InfluxDBClient

class DBConnexion:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.client = InfluxDBClient(host=host, port=port)

    def get_controllable_systems(self, controllable_system):
        self.client.switch_database('CONTROLLABLE_SYSTEMS')
        myquery = "SELECT last(value), id_station FROM %s GROUP BY id_station" % controllable_system
        result_set = self.client.query(myquery)
        return result_set

    def get_state(self, controllable_system, id_station):
        self.client.switch_database('CONTROLLABLE_SYSTEMS')
        myquery = "SELECT last(value), id_station FROM %s GROUP BY id_station" % controllable_system
        result_set = self.client.query(myquery)
        for mypoint in result_set.get_points():
            if mypoint['id_station'] == id_station:
                return mypoint['last']

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

    def get_last_measurement_value(self, measurement, id_station, seconds_time_limit=600):
        self.client.switch_database('SENSOR_DATA')
        myquery = "SELECT last(value), id_station FROM %s WHERE time > now() - %is GROUP BY id_station" % (measurement, seconds_time_limit)
        result_set = self.client.query(myquery)
        for mypoint in result_set.get_points():
            if mypoint['id_station'] == id_station:
                return mypoint['last']

    def get_mode(self):
        self.client.switch_database('CONTROLLABLE_SYSTEMS')
        myquery = "SELECT last(value) FROM mode"
        result_set = self.client.query(myquery)
        for mypoint in result_set.get_points():
            return mypoint['last']

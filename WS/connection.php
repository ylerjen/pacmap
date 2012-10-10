<?php

class Connection{

private static $user = 'user';
private static $pass = 'user';
private static $host = '127.0.0.1';
private static $port = 1234;
private static $dbname = 'roads_vaud';

    public function connect(){
        $conn_string = "host=".self::$host." port=".self::$port." dbname=".self::$dbname." user=".self::$user." password=".self::$pass;
        return pg_connect($conn_string);
    }
}
<?php
    class Baza {
        
        private $user='root';
        private $pass='';
        private $host='localhost';
        private $imeBaze='plantech';
        private $dbh;
        
        function __construct() {
            $kon="mysql:host=$this->host;dbname=$this->imeBaze;";
            $this->dbh=new PDO($kon,$this->user,$this->pass);
        }
        
        function __destruct() {
            $this->dbh=null;
        }
        
        function ubaciUBazu($usrname, $password, $name, $surname, $email, $birth, $country)
        {
            $password1=  sha1($password);
            echo $username;
            echo $password1;
            $sql="insert into user(username,password,name,surname,email,birth,country) values('$username','$password1','$name','$surname','$email','$birth','$country')";
            $pom=$this->dbh->exec($sql);                   
        }
        
    }
    $baza=new Baza();
    $baza->ubaciUBazu('pera', 'peraPeric1','Pera','Peric','pera@gmail.com','1978-03-06','Srbija');
    $baza->ubaciUBazu('mika', 'mikaMikic1','Mika','Mikic','mika@gmail.com','1976-07-06','Srbija');
    $baza->ubaciUBazu('laza', 'lazaLazic1','Laza','Lazic','laza@gmail.com','1986-04-11','Srbija');
?>

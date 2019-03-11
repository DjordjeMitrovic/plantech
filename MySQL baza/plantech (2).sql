-- phpMyAdmin SQL Dump
-- version 4.6.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 24, 2017 at 09:25 AM
-- Server version: 5.7.14
-- PHP Version: 5.6.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `plantech`
--

-- --------------------------------------------------------

--
-- Table structure for table `measuring`
--

CREATE TABLE `measuring` (
  `id` int(11) NOT NULL,
  `date` datetime NOT NULL,
  `idPlant` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `measuring`
--

INSERT INTO `measuring` (`id`, `date`, `idPlant`) VALUES
(1, '2017-03-24 00:00:00', 3),
(2, '2017-03-23 00:00:00', 3),
(3, '2017-03-22 00:00:00', 3),
(4, '2017-03-21 00:00:00', 3);

-- --------------------------------------------------------

--
-- Table structure for table `measuring_detail`
--

CREATE TABLE `measuring_detail` (
  `id` int(11) NOT NULL,
  `idMeasure` int(11) NOT NULL,
  `measurment` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `measuring_detail`
--

INSERT INTO `measuring_detail` (`id`, `idMeasure`, `measurment`) VALUES
(1, 3, '{"C" : 21, "N": 145, "O": 332, "H": 4, "S": 74, "Pi": 61, "Si": 22, "Cl": 39, "Na": 50, "Mg": 31, "Al": 53, "Fe": 45, "Mn": 31, "Vlaznost": 1}'),
(3, 1, '{"C" : 20, "N": 15, "O": 30, "H": 14, "S": 14, "Pi": 11, "Si": 2, "Cl": 30, "Na": 40, "Mg": 41, "Al": 23, "Fe": 44, "Mn": 32, "Vlaznost": 32}'),
(4, 2, '{"C" : 10, "N": 19, "O": 90, "H": 18, "S": 94, "Pi": 31, "Si": 22, "Cl": 301, "Na": 48, "Mg": 71, "Al": 73, "Fe": 34, "Mn": 32, "Vlaznost": 36}'),
(5, 4, '{"C" : 265, "N": 151, "O": 301, "H": 314, "S": 154, "Pi": 151, "Si": 223, "Cl": 354, "Na": 430, "Mg": 41, "Al": 53, "Fe": 34, "Mn": 31, "Vlaznost": 39}');

-- --------------------------------------------------------

--
-- Table structure for table `owner_parcel`
--

CREATE TABLE `owner_parcel` (
  `id` int(11) NOT NULL,
  `idOwner` int(11) NOT NULL,
  `idParcel` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `owner_parcel`
--

INSERT INTO `owner_parcel` (`id`, `idOwner`, `idParcel`) VALUES
(2, 7, 1),
(3, 4, 3);

-- --------------------------------------------------------

--
-- Table structure for table `parcel`
--

CREATE TABLE `parcel` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `parcel`
--

INSERT INTO `parcel` (`id`, `name`) VALUES
(1, 'Parcela 1'),
(2, 'Parcela 2'),
(3, 'Parcela 3');

-- --------------------------------------------------------

--
-- Table structure for table `plantation`
--

CREATE TABLE `plantation` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `plantation`
--

INSERT INTO `plantation` (`id`, `name`) VALUES
(1, 'Plant 1'),
(2, 'Plant 2'),
(3, 'Plant 3');

-- --------------------------------------------------------

--
-- Table structure for table `plant_parcel`
--

CREATE TABLE `plant_parcel` (
  `id` int(11) NOT NULL,
  `idPlant` int(11) NOT NULL,
  `idParcel` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `plant_parcel`
--

INSERT INTO `plant_parcel` (`id`, `idPlant`, `idParcel`) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 3, 3);

-- --------------------------------------------------------

--
-- Table structure for table `plant_type`
--

CREATE TABLE `plant_type` (
  `id` int(11) NOT NULL,
  `idPlant` int(11) NOT NULL,
  `idType` int(11) NOT NULL,
  `idSubType` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `plant_type`
--

INSERT INTO `plant_type` (`id`, `idPlant`, `idType`, `idSubType`) VALUES
(1, 3, 1, 1),
(2, 1, 2, 2),
(3, 2, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `producerofseeds`
--

CREATE TABLE `producerofseeds` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `producerofseeds`
--

INSERT INTO `producerofseeds` (`id`, `name`) VALUES
(1, 'Delta Agrar'),
(2, 'Proizv.kruske');

-- --------------------------------------------------------

--
-- Table structure for table `producer_subtype`
--

CREATE TABLE `producer_subtype` (
  `id` int(11) NOT NULL,
  `idProducer` int(11) NOT NULL,
  `idSubType` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `producer_subtype`
--

INSERT INTO `producer_subtype` (`id`, `idProducer`, `idSubType`) VALUES
(1, 1, 1),
(2, 2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `permission` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`id`, `name`, `permission`) VALUES
(1, 'gost', 0),
(2, 'radnik', 8),
(3, 'ekspert', 12),
(4, 'sef', 14),
(5, 'gazda', 15),
(6, 'sin', 10);

-- --------------------------------------------------------

--
-- Table structure for table `subtype`
--

CREATE TABLE `subtype` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `subtype`
--

INSERT INTO `subtype` (`id`, `name`) VALUES
(1, 'Zlatni delises'),
(2, 'Junska lepotica');

-- --------------------------------------------------------

--
-- Table structure for table `type`
--

CREATE TABLE `type` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `visible` tinyint(1) NOT NULL,
  `idUser` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `type`
--

INSERT INTO `type` (`id`, `name`, `visible`, `idUser`) VALUES
(1, 'Jabuka', 1, 4),
(2, 'Kruska', 1, 4);

-- --------------------------------------------------------

--
-- Table structure for table `type_subtype`
--

CREATE TABLE `type_subtype` (
  `idType` int(11) NOT NULL,
  `idSubType` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `surname` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `birth` varchar(50) NOT NULL,
  `country` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `username`, `password`, `name`, `surname`, `email`, `birth`, `country`) VALUES
(4, 'pera', 'c9c2708d92b2b508aefb370ca75824806e97998d', 'Pera', 'Peric', 'pera@gmail.com', '1978-03-06', 'Srbija'),
(5, 'mika', '27d63f7a6415af2003ef9f590c25c9a4017536eb', 'Mika', 'Mikic', 'mika@gmail.com', '1976-07-06', 'Srbija'),
(6, 'laza', '8191f333d9d7851eb448ce3fc8ed3ffe121fffb5', 'Laza', 'Lazic', 'laza@gmail.com', '1986-04-11', 'Srbija'),
(7, 'oijoijiojioj', 'd5d4cd07616a542891b7ec2d0257b3a24b69856e', 'novo ime', 'novo prezime', 'dfgg@fs.com', '2014-12-12', 'undefined'),
(8, 'aaaaaa', '22f4d99d8406e6c0b46d2bf679f7c87b5774a295', 'Jovana', 'Tomovic', 'efe@fefe.com', '2014-12-12', 'Srbija'),
(9, 'ajsjs', '9438cc24eb2f87a6e6d3d4aa252b56d25145739f', 'Jovana', 'Tomovic', 'wdwd@dwd.com', '2014-12-12', 'Srbija'),
(10, 'aaaaaaAA', 'fe6d6a7a4d9266db2e91e4622d3f82c908e5b048', 'Swfwf', 'Owfef', 'efef@dwdw.com', '2014-12-12', 'Srbija'),
(11, 'wodkdwpokdwpokd', 'f8bf30913a85b3626ed64757e28f8813eed6b584', 'Swdwdw', 'Odwdw', 'wdw@dd.com', '2014-12-12', 'Srbija'),
(12, 'ababababa', '41fd79a2f8e3b93f8269f0a06ad8a5c726cc862d', 'Oooo', 'Pefefef', 'efef@efe.com', '2014-12-12', 'Srbija'),
(13, 'iiiiiiiiiiiiiii', 'aaef4134770a7d9573658f90cfe051bc2d7eacbf', 'Iiuh', 'Uhuh', 'efe@fef.com', '2014-12-12', 'Srbija'),
(14, 'oijoiji', '609ba024596d99ef0ae766aba10573c04c7357f3', 'Ii', 'Pp', 'fe@efe.com', '2014-12-12', 'Srbija'),
(15, 'oijIJIJIJIJIJ', 'a9d72f23cf77d52263493870506e17e2bfda59b5', 'Ppp', 'Pwfwf', 'grg@wefw.com', '2014-12-12', 'Srbija'),
(16, 'proba', 'c524de170114224eefc17836976d94508dc584c5', 'Probica', 'Probica', 'dwd@sd.com', '2017-03-01', 'drzava2'),
(17, 'pppppp', '90e481fd0ad69a7b3d429e615b72e656cddebdfc', 'Pr', 'Prr', 'wfe@efw.com', '0000-00-00', 'undefined'),
(18, 'abudil', 'd8b7f7dd9d3d54fa85c1b66c20a95375e41eafb3', 'Abudl', 'Ahmed', 'ahmed@gmail.com', '02-03-2017', 'Barbados');

-- --------------------------------------------------------

--
-- Table structure for table `user_connect`
--

CREATE TABLE `user_connect` (
  `id` int(11) NOT NULL,
  `idOwner` int(11) NOT NULL,
  `idWorker` int(11) NOT NULL,
  `idRole` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user_connect`
--

INSERT INTO `user_connect` (`id`, `idOwner`, `idWorker`, `idRole`) VALUES
(1, 4, 16, 6);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `measuring`
--
ALTER TABLE `measuring`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idPlant` (`idPlant`);

--
-- Indexes for table `measuring_detail`
--
ALTER TABLE `measuring_detail`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idMeasure` (`idMeasure`);

--
-- Indexes for table `owner_parcel`
--
ALTER TABLE `owner_parcel`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idOwner` (`idOwner`),
  ADD KEY `idParcel` (`idParcel`);

--
-- Indexes for table `parcel`
--
ALTER TABLE `parcel`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `plantation`
--
ALTER TABLE `plantation`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `plant_parcel`
--
ALTER TABLE `plant_parcel`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idPlant` (`idPlant`),
  ADD KEY `idParcel` (`idParcel`);

--
-- Indexes for table `plant_type`
--
ALTER TABLE `plant_type`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idPlant` (`idPlant`),
  ADD KEY `idCat` (`idType`),
  ADD KEY `idSubType` (`idSubType`);

--
-- Indexes for table `producerofseeds`
--
ALTER TABLE `producerofseeds`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `producer_subtype`
--
ALTER TABLE `producer_subtype`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idProducer` (`idProducer`),
  ADD KEY `idSubType` (`idSubType`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subtype`
--
ALTER TABLE `subtype`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `type`
--
ALTER TABLE `type`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idUser` (`idUser`);

--
-- Indexes for table `type_subtype`
--
ALTER TABLE `type_subtype`
  ADD KEY `idType` (`idType`),
  ADD KEY `idSubType` (`idSubType`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_connect`
--
ALTER TABLE `user_connect`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idOwner` (`idOwner`),
  ADD KEY `idOwner_2` (`idOwner`),
  ADD KEY `idWorker` (`idWorker`),
  ADD KEY `idRole` (`idRole`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `measuring`
--
ALTER TABLE `measuring`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `measuring_detail`
--
ALTER TABLE `measuring_detail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT for table `owner_parcel`
--
ALTER TABLE `owner_parcel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `parcel`
--
ALTER TABLE `parcel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `plantation`
--
ALTER TABLE `plantation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `plant_parcel`
--
ALTER TABLE `plant_parcel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `plant_type`
--
ALTER TABLE `plant_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `producerofseeds`
--
ALTER TABLE `producerofseeds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `producer_subtype`
--
ALTER TABLE `producer_subtype`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
--
-- AUTO_INCREMENT for table `subtype`
--
ALTER TABLE `subtype`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `type`
--
ALTER TABLE `type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;
--
-- AUTO_INCREMENT for table `user_connect`
--
ALTER TABLE `user_connect`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `measuring`
--
ALTER TABLE `measuring`
  ADD CONSTRAINT `measuring_ibfk_1` FOREIGN KEY (`idPlant`) REFERENCES `plantation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `measuring_detail`
--
ALTER TABLE `measuring_detail`
  ADD CONSTRAINT `measuring_detail_ibfk_1` FOREIGN KEY (`idMeasure`) REFERENCES `measuring` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `owner_parcel`
--
ALTER TABLE `owner_parcel`
  ADD CONSTRAINT `owner_parcel_ibfk_1` FOREIGN KEY (`idOwner`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `owner_parcel_ibfk_2` FOREIGN KEY (`idParcel`) REFERENCES `parcel` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `plant_parcel`
--
ALTER TABLE `plant_parcel`
  ADD CONSTRAINT `plant_parcel_ibfk_1` FOREIGN KEY (`idPlant`) REFERENCES `plantation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `plant_parcel_ibfk_2` FOREIGN KEY (`idParcel`) REFERENCES `parcel` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `plant_type`
--
ALTER TABLE `plant_type`
  ADD CONSTRAINT `plant_type_ibfk_1` FOREIGN KEY (`idSubType`) REFERENCES `subtype` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `plant_type_ibfk_2` FOREIGN KEY (`idType`) REFERENCES `type` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `plant_type_ibfk_4` FOREIGN KEY (`idPlant`) REFERENCES `plantation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `producer_subtype`
--
ALTER TABLE `producer_subtype`
  ADD CONSTRAINT `producer_subtype_ibfk_1` FOREIGN KEY (`idProducer`) REFERENCES `producerofseeds` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `producer_subtype_ibfk_2` FOREIGN KEY (`idSubType`) REFERENCES `subtype` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `type`
--
ALTER TABLE `type`
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`idUser`) REFERENCES `user` (`id`);

--
-- Constraints for table `type_subtype`
--
ALTER TABLE `type_subtype`
  ADD CONSTRAINT `type_subtype_ibfk_1` FOREIGN KEY (`idType`) REFERENCES `type` (`id`),
  ADD CONSTRAINT `type_subtype_ibfk_2` FOREIGN KEY (`idSubType`) REFERENCES `subtype` (`id`);

--
-- Constraints for table `user_connect`
--
ALTER TABLE `user_connect`
  ADD CONSTRAINT `user_connect_ibfk_1` FOREIGN KEY (`idOwner`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_connect_ibfk_2` FOREIGN KEY (`idWorker`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_connect_ibfk_3` FOREIGN KEY (`idRole`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

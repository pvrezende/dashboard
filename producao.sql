-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: producao
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `dados_hora_a_hora`
--

DROP TABLE IF EXISTS `dados_hora_a_hora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dados_hora_a_hora` (
  `id` int NOT NULL AUTO_INCREMENT,
  `data_hora` varchar(45) DEFAULT NULL,
  `qtd_dados` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dados_hora_a_hora`
--

LOCK TABLES `dados_hora_a_hora` WRITE;
/*!40000 ALTER TABLE `dados_hora_a_hora` DISABLE KEYS */;
INSERT INTO `dados_hora_a_hora` VALUES (1,'01/05/2025 06:20:00',6),(2,'01/05/2025 07:25:00',6),(3,'01/05/2025 08:30:00',4),(4,'01/05/2025 09:35:00',6),(5,'01/05/2025 10:40:00',6),(6,'01/05/2025 11:45:00',8),(7,'01/05/2025 12:50:00',4),(8,'01/05/2025 13:55:00',2),(9,'01/05/2025 14:00:00',1),(10,'01/05/2025 15:05:00',3),(13,'05/05/2025 06:40:00',1),(14,'05/05/2025 07:25:00',1),(15,'05/05/2025 08:20:00',2),(16,'05/05/2025 09:55:00',1),(19,'06/05/2025 06:00:00',30),(20,'06/05/2025 07:00:00',7),(21,'06/05/2025 08:00:00',10),(22,'06/05/2025 09:00:00',8),(23,'06/05/2025 10:00:00',8),(24,'06/05/2025 10:00:00',1),(25,'06/05/2025 11:00:00',9),(26,'06/05/2025 15:00:00',5),(27,'06/05/2025 02:00:00',5),(28,'07/05/2025 11:00:00',6),(29,'08/05/2025 06:00:00',12),(30,'08/05/2025 07:00:00',5),(31,'08/05/2025 08:00:00',2),(32,'08/05/2025 09:00:00',4),(33,'08/05/2025 10:00:00',7),(34,'08/05/2025 11:00:00',7),(35,'09/05/2025 12:00:00',11),(36,'09/05/2025 13:00:00',6),(37,'09/05/2025 14:00:00',10),(38,'09/05/2025 15:00:00',10),(39,'09/05/2025 16:00:00',10),(40,'12/05/2025 08:00:00',4),(41,'12/05/2025 09:00:00',4),(42,'12/05/2025 10:00:00',9),(43,'12/05/2025 11:00:00',10);
/*!40000 ALTER TABLE `dados_hora_a_hora` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eficiencia`
--

DROP TABLE IF EXISTS `eficiencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eficiencia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `qtd` int DEFAULT NULL,
  `flag` varchar(15) DEFAULT NULL,
  `data_hora` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eficiencia`
--

LOCK TABLES `eficiencia` WRITE;
/*!40000 ALTER TABLE `eficiencia` DISABLE KEYS */;
INSERT INTO `eficiencia` VALUES (1,360,'produtiva','01/05/2025 00:00:00'),(2,0,'parada','01/05/2025 00:00:00'),(3,192,'rejeitada','01/05/2025 00:00:00'),(4,48,'produtiva','05/05/2025 00:00:00'),(5,0,'parada','05/05/2025 00:00:00'),(6,12,'rejeitada','05/05/2025 00:00:00'),(12,828,'produtiva','06/05/2025 11:00:00'),(13,2,'rejeitada','06/05/2025 11:00:00'),(14,2,'rejeitada','06/05/2025 11:00:00'),(15,1,'rejeitada','06/05/2025 13:00:00'),(16,0,'','07/05/2025 09:01:23'),(17,5,'','07/05/2025 10:00:00'),(18,1,'','07/05/2025 11:00:00'),(19,6,'','07/05/2025 13:00:00'),(20,2,'','07/05/2025 14:00:00'),(23,4,'rejeitada','08/05/2025 11:00:00'),(24,-4,'rejeitada','08/05/2025 11:00:00'),(25,4,'rejeitada','08/05/2025 11:00:00'),(26,80,'produtiva','08/05/2025 11:00:00'),(27,7,'rejeitada','08/05/2025 10:00:00'),(28,1,'rejeitada','08/05/2025 13:00:00'),(29,1,'rejeitada','08/05/2025 13:00:00'),(30,1,'rejeitada','08/05/2025 14:00:00'),(33,9,'rejeitada','12/05/2025 11:00:00');
/*!40000 ALTER TABLE `eficiencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meta_dia`
--

DROP TABLE IF EXISTS `meta_dia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meta_dia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `meta` int DEFAULT NULL,
  `data_hora` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meta_dia`
--

LOCK TABLES `meta_dia` WRITE;
/*!40000 ALTER TABLE `meta_dia` DISABLE KEYS */;
INSERT INTO `meta_dia` VALUES (1,62,'01/05/2025'),(2,0,'01/05/2025'),(3,62,'05/05/2025'),(6,80,'06/05/2025'),(7,80,'08/05/2025'),(8,80,'09/05/2025'),(9,80,'12/05/2025');
/*!40000 ALTER TABLE `meta_dia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projetos`
--

DROP TABLE IF EXISTS `projetos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projetos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) DEFAULT NULL,
  `lider` varchar(255) DEFAULT NULL,
  `equipe_json` text,
  `etapa_atual` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projetos`
--

LOCK TABLES `projetos` WRITE;
/*!40000 ALTER TABLE `projetos` DISABLE KEYS */;
INSERT INTO `projetos` VALUES (1,'Projeto Alpha','Lucas Lima','[\"Maria\",\"João\",\"Carlos\"]',2);
/*!40000 ALTER TABLE `projetos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-14 15:36:32

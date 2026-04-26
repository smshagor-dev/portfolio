ALTER TABLE `SiteSettings`
    ADD COLUMN `adsenseHeadCode` LONGTEXT NOT NULL DEFAULT '',
    ADD COLUMN `adsensePageTopCode` LONGTEXT NOT NULL DEFAULT '',
    ADD COLUMN `adsenseBetweenSectionsCode` LONGTEXT NOT NULL DEFAULT '',
    ADD COLUMN `adsensePageBottomCode` LONGTEXT NOT NULL DEFAULT '';

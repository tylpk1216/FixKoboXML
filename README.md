## FixKoboXML
修正 Kobo 電子書 XHTML 格式問題，此問題會造成 kindlegen 轉完的檔案在 Kindle 裝置上開啟呈現亂碼。

## 問題發生原因
正常 XHTML 檔案如下所示，會有 <?xml> 及 <!DOCTYPE html> 2 個 tag。Kobo 有問題的書都會缺少這 2 個 tag，故這隻程式便是自動解壓縮 EPUB 檔，加入缺少的 tag，並在壓縮回一個 EPUB 檔案。

## 使用方式
* git clone https://github.com/tylpk1216/FixKoboXML/
* install node.js
* cd FixKoboXML folder
* npm install .
* node main.js XXX.EPUB

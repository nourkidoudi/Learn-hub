UPDATE lessons SET content_type = 'pdf' WHERE content_url LIKE '%.pdf';
SELECT id, title, content_type, content_url FROM lessons;

import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://axxwahecopzsbwgqtqgp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4eHdhaGVjb3B6c2J3Z3F0cWdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYwNTc0NCwiZXhwIjoyMDk0MTgxNzQ0fQ.pqaHR1p4MPxFtIDhZvTuvQPeBAi9A9K6RMzTjV1OY-Q'
)

const data = JSON.parse(
  fs.readFileSync('./genesis.json', 'utf8')
)

async function uploadBible() {

  for (const chapterData of data.chapters) {

    for (const verseData of chapterData.verses) {

      const { error } = await supabase
        .from('eci_songbook')
        .insert({
          book: data.book.english,
          chapter: Number(chapterData.chapter),
          verse: Number(verseData.verse),
          text: verseData.text,
          language: 'ta',
          type: 'bible'
        })

      if (error) {
        console.log(error)
      }
    }
  }

  console.log('Bible uploaded successfully')
}

uploadBible()//import fs from 'fs'
//import { createClient } from '@supabase/supabase-js'
//
//const supabase = createClient(
//  'https://axxwahecopzsbwgqtqgp.supabase.co',
//  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4eHdhaGVjb3B6c2J3Z3F0cWdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYwNTc0NCwiZXhwIjoyMDk0MTgxNzQ0fQ.pqaHR1p4MPxFtIDhZvTuvQPeBAi9A9K6RMzTjV1OY-Q'
//)
//
//const data = JSON.parse(
//  fs.readFileSync('./genesis.json', 'utf8')
//)
//
//async function uploadBible() {
//
//  for (const verse of data) {
//
//    const { error } = await supabase
//      .from('eci_songbook')
//      .insert({
//        book: verse.book,
//        chapter: verse.chapter,
//        verse: verse.verse,
//        text: verse.text,
//        language: 'ta',
//        type: 'bible'
//      })
//
//    if (error) {
//      console.log(error)
//    }
//  }
//
//  console.log('Upload completed')
//}
//
//uploadBible()
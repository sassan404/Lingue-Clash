# Lingue Clash

**Lingue Clash** is an interactive, multiplayer game designed to make learning languages fun, motivating, competitive, and challenging. Players join rooms, compete in rounds, and improve their language skills while playing with their friends.

I got the idea as I was practicing French with my friend who was practicing Arabic, and we weree starting to loose motivation. So I thought I could turn it into a game.

---

## 🛠️ **Tech Stack**

Lingue Clash is built using a modern tech stack to ensure a smooth and responsive gaming experience:

- **Frontend**: Developed with Angular, following a single-page application (SPA) architecture.
- **Backend**: Implemented using Firebase Functions for serverless computing.
- **Database**: Firebase Realtime Database is used for real-time data synchronization and storage.
- **Hosting**: The application is hosted on Firebase App Hosting (still a beta feature in firebase console)

---

## 🎮 **Game Phases**

1. **Lobby Phase**

   - A player creates a room to play the game, this player is ocnsidered the game admin
   - The game admin can update some game properties including the words to be practiced in this game
   - Players join a room using a unique room code.
   - Room information includes the list of players, their chosen languages, and the readiness status.
   - Players press the **Ready** button to indicate they are prepared to start the game.

2. **Round Phase**

   - Players receive words in their selected language and must form sentences.
   - Each sentence is scored based on correctness, grammar, and creativity.
   - Rounds progress dynamically, with increasing complexity as the game advances by increasing the number of words that must be used per round.

3. **End Phase**
   - After all rounds are completed, results are displayed:
     - Final scores for each player.
     - Detailed round-by-round breakdowns.
     - Overall rankings.

---

## 🔧 **Key Features**

- **Different Game Modes**: The game can be played solo or multiplayer, and for multi player we can choose to have the admin being a view screen and not a player themselves.
- **Multilingual Support**: Players can choose different languages to practice within the same game room.
- **Dynamic Rounds**: Each round grows in complexity, challenging players' language skills.
- **Real-time Updates**: The game leverages Firebase Realtime Database to reflect changes instantly.
- **AI Assistance**: AI can evaluate players' responses, providing feedback on grammar and vocabulary.

---

## 🖌️ **Game Design**

- **Icon**: The logo features a pen and quiver crossed behind the title "Lingue Clash," symbolizing a clash of creativity and knowledge.
- **UI Components**:
  - **Angular Material** is used for interactive elements like progress bars, tabs, and player lists.
  - **Responsive Layout** ensures compatibility across devices.

---

## 🚀 **How to Play**

1. **Create a Room**:

   - Enter your username and select the language you wish to practice.
   - Share the generated room code with friends.

2. **Join a Room**:

   - Use the room code provided by the creator.
   - Enter your username and select your preferred language.

3. **Update Game Properties**:

   - Admin can choose the number of rounds and number of words to be practiced in the game.
   - Admin can also choose the words to be practiced during the game.

4. **Start the Game**:

   - Once all players are ready, the game begins with the first round.
   - Answer the prompts by forming sentences with the given words.

5. **View Results**:
   - Check your performance after each round and at the end of the game.
   - Analyze scores and rankings to track your progress.

---

## 🌟 **Why Lingue Clash?**

Lingue Clash is more than just a game—it's a platform to enhance your language skills while having fun with friends. Whether you're looking to compete, collaborate, or simply practice, Lingue Clash provides an exciting and engaging environment.

**Join the clash, sharpen your skills, and conquer languages with your friends!**

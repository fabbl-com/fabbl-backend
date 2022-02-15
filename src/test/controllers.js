/* eslint-disable import/no-extraneous-dependencies */
import casual from "casual";
import { v4 as uuidv4 } from "uuid";
import gravatar from "gravatar";
import User from "../models/userModel.js";

const getVal = () => {
  const interests = [
    "3D printing",
    "Amateur radio",
    "Scrapbook",
    "Amateur radio",
    "Acting",
    "Baton twirling",
    "Board games",
    "Book restoration",
    "Cabaret",
    "Calligraphy",
    "Candle making",
    "Computer programming",
    "Coffee roasting",
    "Cooking",
    "Colouring",
    "Cosplaying",
    "Couponing",
    "Creative writing",
    "Crocheting",
    "Cryptography",
    "Dance",
    "Digital arts",
    "Drama",
    "Drawing",
    "Do it yourself",
    "Electronics",
    "Embroidery",
    "Fashion",
    "Flower arranging",
    "Foreign language learning",
    "Gaming",
    "Tabletop games",
    "Role-playing games",
    "Gambling",
    "Genealogy",
    "Glassblowing",
    "Gunsmithing",
    "Homebrewing",
    "Ice skating",
    "Jewelry making",
    "Jigsaw puzzles",
    "Juggling",
    "Knapping",
    "Knitting",
    "Kabaddi",
    "Knife making",
    "Lacemaking",
    "Lapidary",
    "Leather crafting",
    "Lego building",
    "Lockpicking",
    "Machining",
    "Macrame",
    "Metalworking",
    "Magic",
    "Model building",
    "Listening to music",
    "Origami",
    "Painting",
    "Playing musical instruments",
    "Pet",
    "Poi",
    "Pottery",
    "Puzzles",
    "Quilting",
    "Reading",
    "Scrapbooking",
    "Sculpting",
    "Sewing",
    "Singing",
    "Sketching",
    "Soapmaking",
    "Sports",
    "Stand-up comedy",
    "Sudoku",
    "Table tennis",
    "Taxidermy",
    "Video gaming",
    "Watching movies",
    "Web surfing",
    "Whittling",
    "Wood carving",
    "Woodworking",
    "World Building",
    "Writing",
    "Yoga",
    "Yo-yoing",
    "Air sports",
    "Archery",
    "Astronomy",
    "Backpacking",
    "Base jumping",
    "Baseball",
    "Basketball",
    "Beekeeping",
    "Bird watching",
    "Blacksmithing",
    "Board sports",
    "Bodybuilding",
    "Brazilian jiu-jitsu",
    "Community",
    "Cycling",
    "Dowsing",
    "Driving",
    "Fishing",
    "Flag football",
    "Flying",
    "Flying disc",
    "Foraging",
    "Gardening",
    "Geocaching",
    "Ghost hunting",
    "Graffiti",
    "Handball",
    "Hiking",
    "Hooping",
    "Horseback riding",
    "Hunting",
    "Inline skating",
    "Jogging",
    "Kayaking",
    "Kite flying",
    "Kitesurfing",
    "Larping",
    "Letterboxing",
    "Metal detecting",
    "Motor sports",
    "Mountain biking",
    "Mountaineering",
    "Mushroom hunting",
    "Mycology",
    "Netball",
    "Nordic skating",
    "Orienteering",
    "Paintball",
    "Parkour",
    "Photography",
    "Polo",
    "Rafting",
    "Rappelling",
    "Rock climbing",
    "Roller skating",
    "Rugby",
    "Running",
    "Sailing",
    "Sand art",
    "Scouting",
    "Scuba diving",
    "Sculling",
    "Rowing",
    "Shooting",
    "Shopping",
    "Skateboarding",
    "Skiing",
    "Skim Boarding",
    "Skydiving",
    "Slacklining",
    "Snowboarding",
    "Stone skipping",
    "Surfing",
    "Swimming",
    "Taekwondo",
    "Tai chi",
    "Urban exploration",
    "Vacation",
    "Vehicle restoration",
    "Water sports",
  ];

  const getHobbies = () => {
    const arr = [];
    for (let i = 0; i < 5; i++) {
      const val = interests[Math.floor(Math.random() * interests.length)];
      arr.push(val);
    }
    return arr;
  };

  const { email } = casual;
  const avatar = gravatar.url(email, { s: "100", r: "x", d: "retro" }, true);
  const users = {
    uuid: uuidv4(),
    displayName: {
      value: casual.name,
      status: 3,
    },
    email,
    isEmailVerifed: true,
    password: "$2b$12$i50RREpc.jEDQy.Y1ftwsuufs3Af5NYHpR.vMsuexVz8Ak1GQ2tR2",
    dob: {
      value: new Date(
        new Date() -
          (Math.ceil(Math.random() * 17) + 13) * 365 * 24 * 60 * 60 * 1000
      ),
      status: 3,
    },
    hobby: {
      status: 2,
      value: getHobbies(),
    },
    location: {
      value: casual.city,
      status: 3,
    },
    gender: {
      value: Math.floor(Math.random() * 2),
      status: 3,
    },
    avatar: {
      value: avatar,
      status: 3,
    },
    relationshipStatus: {
      value: Math.floor(Math.random() * 4),
      status: 3,
    },
    lastLogin: new Date(
      new Date() - Math.ceil(Math.random() * 30) * 24 * 60 * 60 * 1000
    ),
  };
  return users;
};

export const insertUser = async (req, res, next) => {
  const arr = [];
  for (let i = 0; i < 50; i++) {
    arr.push(getVal());
  }
  try {
    const result = await User.insertMany(arr);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
  return arr;
};

// const

console.log(insertUser());

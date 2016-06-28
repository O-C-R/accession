String[] rows = loadStrings("start_fj.txt");
PrintWriter firsts = createWriter("firstsDisplay.txt");
PrintWriter lasts = createWriter("lastsDisplay.txt");
PrintWriter wholes = createWriter("fullNames.txt");
PrintWriter aggregates = createWriter("aggregateNames.txt");

float timePer = 0.05;

String prevName = "";
float agg = 0;

for (int i = 0; i < 4760; i++) {
 String name = rows[i]; 
 wholes.println(name);
 String[] s = name.split(" ");
 firsts.println("~4;" + timePer + ":DISPLAY-" + s[0]);
 lasts.print("~5;" + timePer + ":DISPLAY-");
 for(int j = 1; j < s.length; j++) {
  lasts.print(s[j] + " "); 
 }
 lasts.println("");
 
 if (!s[0].equals(prevName)) {
   prevName = s[0];
   aggregates.println("~0123;" + agg + ":" + s[0]); 
   agg = 0;
 }
 
 agg += timePer;
}

firsts.flush();
firsts.close();

lasts.flush();
lasts.close();

wholes.flush();
wholes.close();

aggregates.flush();
aggregates.close();

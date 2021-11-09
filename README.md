# html-table-excel-like-filters

Create a filterable table with search for each columns directly from an HTML table or built it from a custom array

## Implementation

- Copy/Paste the c_table.js file and the c_table.css file to your server's client folder.
- Call the library from your html code.
- Call the table creator from the script

```
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Xali</title>
    <link rel="stylesheet" href="/css/c_table.css">
</head>

<body>
    <table id="existingTable">
        <thead>
            <tr>
                <th>NAME</th><th>ROLE</th><th>DATE</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Alberto</td><td>Operative</td><td>25/09/2021</td>
            </tr>
            <tr>
                <td>Julio</td><td>Operative</td><td>21/04/2020</td>
            </tr>
            <tr>
                <td>Frederika</td><td>Manager</td><td>02/04/2019</td>
            </tr>
            <tr>
                <td>Frederika</td><td>Operative</td><td>15/12/2018</td>
            </tr>
        </tbody>
    </table>

    <div id="holderForGeneratedTable"></div>

    <!--Main script-->
    <script src="/js/c_table.js"></script>
    <script>

    //============================
    //Create filters from an existing table
    //============================

    const staticTab = new SuperTable("myTable",{
        name:'Users',
        avoid:[3]
    });

    //============================
    //Create filters from an array
    //============================

    //Create the array for example purpose
    const data = [
    ["Name","Role","Activity","Dummy","Controls"],
    ["CCB567D86BC859F4","Joe","Manager","Banlouze","Dummy",{ctrl:"sayHi"}],
    ["15188","Paul","Tech","Actif","Dummy",{ctrl:"sayHi"}],
    ["15315","Jack","Admin","Banlouze","Dummy",{ctrl:"sayHi"}],
    ["15889","Paul","Manager","Banlouze","Dummy",{ctrl:"sayHi"}]]

    //Build the options for the table
    const options = {
        name:"User-generated",
        target:document.getElementById("holderForGeneratedTable"),
        avoid:[3,4],
        rowAction:"showModal",
        actions:{
            sayHi:{
                label:"Say hi !",
                func:(e)=>{
                    e.stopPropagation();
                    const id = e.currentTarget.id;
                    console.log("Hi, my name is ",id);
                }
            },
            showModal:{
                label:"Show your name",
                func:(row)=>{
                    const targetId = row.id;
                    console.log("Hey, I am associated with item ",targetId);
                }
            }
        }
    }

    //Invoke table creation from the array
    const genereatedTab = new SuperTable(data,options);

</script>
</body>
</html>
```

Example file is avaiable in the example folder.

## Options

Here are the options avaible for generation from existing table :

```
const options = {
            name:"User-generated", //Mandatory for id naming
            avoid:[3,4], //Index of columns that have to be ignored
        }

```

Here are the options avaible for generation from an array:

```
const options = {
    name:"User-generated", //Mandatory for id naming
    target:document.getElementById("holderForGeneratedTable"), //HTML element that will hold the table
    avoid:[3,4], //Index of columns that have to be ignored
    rowAction:"showModal", //Event that should be fired at click for each row
    actions:{ //Functions pool for invocation from a cell or row
        sayHi:{
            label:"Say hi !",
            func:(e)=>{
                e.stopPropagation();
                const id = e.currentTarget.id;
                console.log("Hi, my name is ",id);
            }
        },
        showModal:{
            label:"Show your name",
            func:(row)=>{
                const targetId = row.id;
                console.log("Hey, I am associated with item ",targetId);
            }
        }
    }
}
```

To invoke a button inside the table, the array item should have the following syntax : `{ctrl:"[action name]"}`

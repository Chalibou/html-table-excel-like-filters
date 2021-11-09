
const staticTab = new SuperTable("myTable",{
    name:'Users',
    avoid:[3]
});

const forms = new FormManager(document.getElementById("userPanel"));
forms.addForm({
    name:"userForm",
    structure:[
        [
            {
                type:"static",
                val:"Voici les infos que j'ai trouvé",
                new:"Veuillez renseigner les champs suivants"
            },
            {
                name:"id",
                type:"text"
            },
            {
                name:"name",
                type:"input",
                default:""
            }
        ],
        [
            {
                name:"mail",
                type:"mail",
                default:""
            },
            {
                name:"group",
                type:"select",
                options:["admin","manager","operative"],
                default:"operative"
            },
            {
                name:"removable",
                type:"boolean",
                default:true
            },
            {
                name:"number",
                type:"slider",
                min:0,
                max:150,
                step:1,
                default:50
            }
        ]
    ],
    get:"user_get",
    set:"user_set",
    new:"register"
});

const data = [
    ["Nom","Role","Activité","Dummy","Controles"],
    ["CCB567D86BC859F4","Joe","Manager","Banlouze","Dummy",{ctrl:"sayHi"}],
    ["15188","Paul","Tech","Actif","Dummy",{ctrl:"sayHi"}],
    ["15315","Jack","Admin","Banlouze","Dummy",{ctrl:"sayHi"}],
    ["15889","Paul","Manager","Banlouze","Dummy",{ctrl:"sayHi"}],
]
const options = {
    name:"uzerz",
    target:document.getElementById("tableHolder"),
    avoid:[3,4],
    rowAction:"showModal",
    actions:{
        sayHi:{
            label:"Dis coucou",
            func:(e)=>{
                e.stopPropagation();
                const id = e.currentTarget.id;
                console.log("Coucou, je suis ",id);
            }
        },
        showModal:{
            label:"Show",
            func:async (row)=>{
                const targetId = row.id;
                const id = targetId.split("_")[1];
                const event = await forms.getEvent("userForm",id);
                document.getElementById(targetId).addEventListener("click",event);
            }
        }
    }
}

const genereatedTab = new SuperTable(data,options);

async function init(){
    const event = await forms.getEvent("userForm","CCB567D86BC859F4");
    document.getElementById("CCB567D86BC859F4").addEventListener("click",event);
    const event2 = await forms.getEvent("userForm",undefined);
    document.getElementById("test").addEventListener("click",event2);
}
init();

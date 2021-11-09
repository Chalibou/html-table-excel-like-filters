class SuperTable{

    constructor(_data,_options){
        if (!_options.name) {console.log("Name of table undefined"); return;}

        if (Array.isArray(_data)) {
            if (!_options.target) {console.log("Target of table undefined"); return;}
            this.options = _options;
            this.name = this.options.name;
            this.heads = [];
            this.rows = [];
            this.filters = {};
            this.avoids = this.options.avoid || [];
            this.createTable(_data);
            this.build();
        }else{
            this.table = document.getElementById(_data);
            this.heads = this.table.getElementsByTagName("tHead")[0].getElementsByTagName("tr")[0].children;
            this.rows = this.table.getElementsByTagName("tBody")[0].children;
            this.data = [];
            this.headSize = 0;
            this.filters = {};
            this.options = _options;
            this.avoids = this.options.avoid || [];
            this.extractData()
            this.build();
        }
    }

    createTable(_data){
        const table = document.createElement("table");
        const heads = document.createElement("tHead");
        const rows = document.createElement("tBody");
        //Build header
        const trh = document.createElement("tr");
        this.headSize = _data[0].length;
        for (let i = 0; i < _data[0].length; i++) {
            const th = document.createElement("th");
            th.innerHTML = _data[0][i];
            this.heads.push(th);
            trh.append(th);
        }
        heads.append(trh);
        table.append(heads);
        //Build body
        for (let i = 1; i < _data.length; i++) {
            const _id = _data[i].shift();
            const tr = document.createElement("tr");
            tr.id = this.name + "_" + _id;
            if (this.options.rowAction) {
                const event = this.options.actions[this.options.rowAction].func;
                event(tr);
            }
            for (let j = 0; j < _data[i].length; j++) {
                //Check for commands
                const td = document.createElement("td");
                if (typeof _data[i][j] == "object") {
                    //Create a button and link it to specified command
                    const button = document.createElement("button");
                    const action = this.options.actions[_data[i][j].ctrl];
                    if (!action) {console.log("No options for action : ",_data[i][j]); return;}
                    button.innerHTML = action.label;
                    button.id = this.name + "_" + _data[i][j].ctrl + "_" + _id
                    button.addEventListener("click",action.func);
                    td.append(button);
                }else{
                    //Paste raw data
                    td.innerHTML = _data[i][j];
                }               
                tr.append(td);
            }
            this.rows.push(tr);
            rows.append(tr);
        }
        table.append(rows);
        this.options.target.append(table);
        this.data = _data;
        this.table = table;
    }


    extractData(){
        this.data = [[]];
        //Extract data from this.table to this.data
        const headArray = Array.from(this.heads);
        this.headSize = headArray.length;
        for (let i = 0; i < this.headSize; i++) {
            this.data[0].push(headArray[i].innerHTML);
        }
        const rows = Array.from(this.rows);
        for (let i = 0; i < rows.length; i++) {
            this.data[i+1] = [];
            const items = Array.from(rows[i].children);
            for (let j = 0; j < items.length; j++) {
                if (this.avoids.some((item)=>{return item == j})){
                    this.data[i+1].push(null);
                }else{
                    this.data[i+1].push(items[j].innerHTML);
                }
            }
        }
    }

    /**
     * Build a table from array data
     * @param {Array} this.data Array of table
     * @returns 
     */
    build(){
        for (let i = 0; i < this.data[0].length; i++) {
            if (this.avoids.some((item)=>{return item == i})){
                this.filters[i] = null;
                continue;
            }
            let list = [];
            //Build a list of unique reference in col i
            for (let j = 1; j < this.data.length; j++) {
                const elmt = this.data[j][i];
                if (!list.some((item)=>{return item == elmt})) {
                    list.push(elmt)
                }
            }
            //Initiate this.filters
            this.filters[i] = {
                filter:list,
                search:""
            };
            //Create a panel with actions based on list
            const panel = new Panel(i,list,this);
            const control = panel.buildControl();
            this.heads[i].append(control);
        }
    }

    setFilter(index,filter,search){
        //Add filter to the filters list
        this.filters[index] = {
            filter:filter,
            search:search
        }
        this.applyFilter();
    }

    applyFilter(){
        //Make rows hidden if they do not match the filter
        for (const line of this.rows) {
            for (let i = 0; i < this.headSize; i++) {
                if (!this.filters[i]) continue;
                const filterObj = this.filters[i];
                const content = line.children[i].innerHTML          
                if (!content.includes(filterObj.search) || !filterObj.filter.some((elmt)=>{return elmt == content})){
                    line.classList.add("cTab_hidden");
                    break;
                }else{
                    line.classList.remove("cTab_hidden");
                }
            }
        }
    }

}
class Panel{
    constructor(i,_list,_parent){
        this.parent = _parent;
        this.list = _list; 
        this.index = i;
        this.control;
        this.search = "";
        this.panel;
        this.filter = JSON.parse(JSON.stringify(_list)); //Avoid reference between list and filter
        this.checks = [];
    }

    handleEvent(e) {
        switch(e.type) {
            case "click":
                this.hide();
            break;
        }
    }

    buildControl(){
        this.control = document.createElement("button");
        this.control.innerHTML = "&#9660";
        this.control.onclick = (e)=>{
            this.show();
            e.stopPropagation();
        }
        this.generatePanel();
        return this.control;
    }

    generatePanel(){
        this.panel = document.createElement("div");
        this.panel.className = "cTab_base";
        this.panel.addEventListener("click",(e)=>{e.stopPropagation();});

        //Search field

        const input = document.createElement("input");
        input.placeholder = "||SEARCH||"
        input.oninput = ()=>{
            if (input.value == "") {
                this.search = "";
                //Apply check status
                this.filter = [];
                for (const item of this.checks) {
                    if (item.checked) {
                        this.filter.push(item["data-label"])
                    }
                }
            }else{
                this.search = input.value;
            }
            this.applyFilter();
        }

        this.panel.append(input);

        //Select all check

        const selectAll = document.createElement("input");
        selectAll.type = "checkbox";
        selectAll.checked = true;
        const selectAllHolder = document.createElement("div");
        selectAllHolder.className = "cTab_label_holder";
        const selectAllLabel = document.createElement("label");
        selectAllLabel.innerHTML = "||SELECT ALL||";
        selectAllHolder.append(selectAll,selectAllLabel);
        selectAll.onchange = ()=>{
            //Hold filters to avoid multiple onchange checkboxes execution
            if(selectAll.checked == true){
                //Select all checkboxes
                for (const item of this.checks) {
                    item.checked = true;
                }
                //Apply total filter
                this.filter = JSON.parse(JSON.stringify(this.list));
            }else{
                //Select all checkboxes
                for (const item of this.checks) {
                    item.checked = false;
                }
                //Apply void filter
                this.filter = [];
            }
            this.applyFilter();
        }
        this.panel.append(selectAllHolder);

        //Detailed labels filters
        for (let k = 0; k < this.list.length; k++) {
            const elmt = this.list[k];

            const holder = document.createElement("div");
            holder.className = "cTab_label_holder";

            const check = document.createElement("input");
            check.type = "checkbox";
            check["data-label"] = elmt;
            check.checked = true;

            check.onchange = (e)=>{
                if (e.target.checked == true) {
                    //Add to the filter
                    this.filter.push(elmt);
                }else{
                    //Remove from the filter
                    const index = this.filter.indexOf(elmt);
                    if (index > -1) {
                        this.filter.splice(index, 1);
                    }
                }              
                //Apply filter
                this.applyFilter();
            }
            const label = document.createElement("label");
            label.innerHTML = elmt;
            holder.append(check,label);
            this.panel.append(holder);
            this.checks.push(check);
        }
        document.body.append(this.panel);
    }

    show(){
        //click background to clear any existing modals
        document.body.click();
        //Position panel
        const box = this.control.getBoundingClientRect();
        this.panel.style.top = box.bottom + "px";
        this.panel.style.left = box.left + "px";
        //Show panel
        this.panel.style.display = "flex";
        //Event for disapearing
        document.body.addEventListener("click",()=>{
            this.panel.style.display = "none";
        },{once:true});
    }

    applyFilter(){
        if (this.filter.length == this.list.length && this.search == "") {
            //Reset button style
            this.control.classList.remove("cTab_hasSearch");
        }else{
            //Apply button style
            this.control.classList.add("cTab_hasSearch");
        }
        this.parent.setFilter(this.index,this.filter,this.search)
    }
    
}
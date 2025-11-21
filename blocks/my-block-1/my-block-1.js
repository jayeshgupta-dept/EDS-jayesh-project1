export default function decorate(block) {
    // console.log("dsfsdfs", block);
    block.classList.add("test-class");
    block.innerHTML = "<h1>BLOCK RETURNED</h1>";
}
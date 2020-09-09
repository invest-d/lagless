import "../public/app";

$(() => {
    $("a.skip").on("click", select_skip);
});

function select_skip() {
    $("#menu").hide();
    $("#skip").show();
    return false;
}

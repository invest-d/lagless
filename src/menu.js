import "../public/app";

$(() => {
    $(".skip_button").on("click", select_skip);
});

const hidable_divisions = [
    "#menu",
    "#confirm",
    "#skip_confirmed",
    "#early",
    "#late"
];

const select_skip = () => {
    show_division("#confirm");
};


const show_division = (target) => {
    for (const division of hidable_divisions) {
        $(division).addClass("d-none");
    }
    $(target).removeClass("d-none");
};

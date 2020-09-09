import "../public/app";

$(() => {
    $(".skip_button").on("click", select_skip);
    $(".early_button").on("click", select_early);
    $(".late_button").on("click", select_late);
    $(".confirm_button").on("click", select_confirm);
    $(".back_button").on("click", back_to_top);
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

const select_confirm = () => {
    show_division("#skip_confirmed");
};

const select_early = () => {
    show_division("#early");
};

const select_late = () => {
    show_division("#late");
};

const back_to_top = () => {
    show_division("#menu");
};

const show_division = (target) => {
    for (const division of hidable_divisions) {
        $(division).addClass("d-none");
    }
    $(target).removeClass("d-none");
};

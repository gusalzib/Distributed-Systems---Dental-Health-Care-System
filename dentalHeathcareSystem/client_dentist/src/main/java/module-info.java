module group.client_dentist {
    requires javafx.controls;
    requires javafx.fxml;


    opens group.client_dentist to javafx.fxml;
    exports group.client_dentist;
}